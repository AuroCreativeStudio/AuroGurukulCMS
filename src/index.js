import fs from "fs";
import path from "path";
import Papa from "papaparse";

const UID = "api::pincode-master.pincode-master";
const CSV_FILENAME = "pincode_masters_cleaned.csv";

// Concurrency runner (NO results array -> avoids OOM)
async function runWithConcurrency(items, limit, worker) {
  const executing = new Set();

  for (const item of items) {
    const p = Promise.resolve()
      .then(() => worker(item))
      .catch(() => {}) // swallow per-item errors (log inside worker if needed)
      .finally(() => executing.delete(p));

    executing.add(p);

    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }

  // wait remaining
  await Promise.all(executing);
}

// Delete in pages (no huge documentId array)
async function deleteAllDocuments(strapi) {
  const pageSize = 1000;

  for (const status of ["draft", "published"]) {
    while (true) {
      const docs = await strapi.documents(UID).findMany({
        status,
        fields: ["documentId"],
        pagination: { start: 0, limit: pageSize }, // always start 0 because we delete as we go
      });

      if (!docs?.length) break;

      const ids = docs.map((d) => d.documentId).filter(Boolean);
      await runWithConcurrency(ids, 15, async (documentId) => {
        await strapi.documents(UID).delete({ documentId });
      });

      console.log(🧹 Deleted ${ids.length} (${status})...);
      if (docs.length < pageSize) break;
    }
  }
}

export default {
  register() {},

  async bootstrap({ strapi }) {
    console.log("🚀 Pincode_Master reset + import started...");

    // 1) DELETE ALL (draft + published)
    await deleteAllDocuments(strapi);
    console.log("✅ Old Pincode_Master data deleted.");

    // 2) READ CSV
    const csvPath = path.join(strapi.dirs.static.public, CSV_FILENAME);

    if (!fs.existsSync(csvPath)) {
      console.error("❌ CSV file not found at:", csvPath);
      console.error(➡️ Put it here: public/${CSV_FILENAME});
      return;
    }

    const csvFile = fs.readFileSync(csvPath, "utf8");

    // 3) PARSE CSV
    const parsed = Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => (h || "").trim(),
    });

    if (parsed.errors?.length) {
      console.error("❌ CSV parse errors:", parsed.errors.slice(0, 5));
      return;
    }

    const rows = parsed.data || [];
    console.log(📂 Found ${rows.length} rows. Importing...);

    let imported = 0;

    // 4) IMPORT (no big cleanRows array)
    await runWithConcurrency(rows, 15, async (r) => {
      const Pincode = (r.Pincode || r.pincode || "").toString().trim();
      const State = (r.State || r.statename || "").toString().trim();
      const District = (r.District || r.district || "").toString().trim();
      const Zone_Tag = (r.Zone_Tag || r.zone_tag || r.ZoneTag || "").toString().trim();

      if (!/^\d{6}$/.test(Pincode) || !State) return;

      await strapi.documents(UID).create({
        data: { Pincode, State, District, Zone_Tag },
        status: "published",
      });

      imported++;
      if (imported % 1000 === 0) console.log(...imported ${imported});
    });

    console.log(✅ Import complete. Imported ${imported} pincodes.);
  },
};