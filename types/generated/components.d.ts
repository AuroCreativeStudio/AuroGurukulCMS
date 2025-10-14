import type { Schema, Struct } from '@strapi/strapi';

export interface DescData extends Struct.ComponentSchema {
  collectionName: 'components_desc_data';
  info: {
    displayName: 'data';
  };
  attributes: {
    scienceof_living: Schema.Attribute.Text;
  };
}

export interface DescDesc extends Struct.ComponentSchema {
  collectionName: 'components_desc_descs';
  info: {
    displayName: 'desc';
  };
  attributes: {};
}

export interface DescSample extends Struct.ComponentSchema {
  collectionName: 'components_desc_samples';
  info: {
    displayName: 'sample';
  };
  attributes: {};
}

export interface SampleSampledata extends Struct.ComponentSchema {
  collectionName: 'components_sample_sampledata';
  info: {
    displayName: 'sampledata';
  };
  attributes: {
    desc: Schema.Attribute.Text;
    icon: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'desc.data': DescData;
      'desc.desc': DescDesc;
      'desc.sample': DescSample;
      'sample.sampledata': SampleSampledata;
    }
  }
}
