import type { Schema, Struct } from '@strapi/strapi';

export interface AdminApiToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_tokens';
  info: {
    description: '';
    displayName: 'Api Token';
    name: 'Api Token';
    pluralName: 'api-tokens';
    singularName: 'api-token';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<''>;
    encryptedKey: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    expiresAt: Schema.Attribute.DateTime;
    lastUsedAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::api-token'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'admin::api-token-permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    type: Schema.Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'read-only'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_token_permissions';
  info: {
    description: '';
    displayName: 'API Token Permission';
    name: 'API Token Permission';
    pluralName: 'api-token-permissions';
    singularName: 'api-token-permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::api-token-permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    token: Schema.Attribute.Relation<'manyToOne', 'admin::api-token'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminPermission extends Struct.CollectionTypeSchema {
  collectionName: 'admin_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'Permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    conditions: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<[]>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::permission'> &
      Schema.Attribute.Private;
    properties: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.Relation<'manyToOne', 'admin::role'>;
    subject: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminRole extends Struct.CollectionTypeSchema {
  collectionName: 'admin_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'Role';
    pluralName: 'roles';
    singularName: 'role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::role'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<'oneToMany', 'admin::permission'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users: Schema.Attribute.Relation<'manyToMany', 'admin::user'>;
  };
}

export interface AdminSession extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_sessions';
  info: {
    description: 'Session Manager storage';
    displayName: 'Session';
    name: 'Session';
    pluralName: 'sessions';
    singularName: 'session';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
    i18n: {
      localized: false;
    };
  };
  attributes: {
    absoluteExpiresAt: Schema.Attribute.DateTime & Schema.Attribute.Private;
    childId: Schema.Attribute.String & Schema.Attribute.Private;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    deviceId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
    expiresAt: Schema.Attribute.DateTime &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::session'> &
      Schema.Attribute.Private;
    origin: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    sessionId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.Unique;
    status: Schema.Attribute.String & Schema.Attribute.Private;
    type: Schema.Attribute.String & Schema.Attribute.Private;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    userId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
  };
}

export interface AdminTransferToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_tokens';
  info: {
    description: '';
    displayName: 'Transfer Token';
    name: 'Transfer Token';
    pluralName: 'transfer-tokens';
    singularName: 'transfer-token';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<''>;
    expiresAt: Schema.Attribute.DateTime;
    lastUsedAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminTransferTokenPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    description: '';
    displayName: 'Transfer Token Permission';
    name: 'Transfer Token Permission';
    pluralName: 'transfer-token-permissions';
    singularName: 'transfer-token-permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token-permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    token: Schema.Attribute.Relation<'manyToOne', 'admin::transfer-token'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminUser extends Struct.CollectionTypeSchema {
  collectionName: 'admin_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'User';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    blocked: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    firstname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    isActive: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<false>;
    lastname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::user'> &
      Schema.Attribute.Private;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    preferedLanguage: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    registrationToken: Schema.Attribute.String & Schema.Attribute.Private;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    roles: Schema.Attribute.Relation<'manyToMany', 'admin::role'> &
      Schema.Attribute.Private;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    username: Schema.Attribute.String;
  };
}

export interface ApiAboutAbout extends Struct.SingleTypeSchema {
  collectionName: 'abouts';
  info: {
    displayName: 'About';
    pluralName: 'abouts';
    singularName: 'about';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    curriculam: Schema.Attribute.Component<'curriculam.curriculam', false>;
    integral_edu_description: Schema.Attribute.Text;
    integral_edu_title: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::about.about'> &
      Schema.Attribute.Private;
    mission_desc: Schema.Attribute.Text;
    publishedAt: Schema.Attribute.DateTime;
    quote: Schema.Attribute.Component<'quote.quote', true>;
    team: Schema.Attribute.Component<'members.team', true>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    vision_desc: Schema.Attribute.Text;
  };
}

export interface ApiActivityFormActivityForm
  extends Struct.CollectionTypeSchema {
  collectionName: 'activity_forms';
  info: {
    displayName: 'Activity Form';
    pluralName: 'activity-forms';
    singularName: 'activity-form';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    city: Schema.Attribute.String;
    course: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email;
    full_name: Schema.Attribute.String;
    grade: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::activity-form.activity-form'
    > &
      Schema.Attribute.Private;
    payment_type: Schema.Attribute.String;
    phone_number: Schema.Attribute.BigInteger;
    publishedAt: Schema.Attribute.DateTime;
    school_name: Schema.Attribute.String;
    screenshot: Schema.Attribute.Media<'images' | 'files'>;
    state: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiActivityActivity extends Struct.SingleTypeSchema {
  collectionName: 'activities';
  info: {
    displayName: 'Activity';
    pluralName: 'activities';
    singularName: 'activity';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    activities_desc: Schema.Attribute.Text;
    activity_list: Schema.Attribute.Component<'activity.activity-list', true>;
    activity_subheading: Schema.Attribute.Text;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::activity.activity'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiAllActivityAllActivity extends Struct.CollectionTypeSchema {
  collectionName: 'all_activities';
  info: {
    displayName: 'All Acitivity';
    pluralName: 'all-activities';
    singularName: 'all-activity';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    activity_description: Schema.Attribute.Text;
    activity_list: Schema.Attribute.Component<'list.activity-list', true>;
    activity_title: Schema.Attribute.String;
    catalogue_pdf: Schema.Attribute.Media<'files'>;
    course_description: Schema.Attribute.Text;
    course_fees: Schema.Attribute.String;
    course_gst: Schema.Attribute.String;
    course_list: Schema.Attribute.Component<'course-list.course-list', true>;
    course_title: Schema.Attribute.String;
    course_video: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    feature_description: Schema.Attribute.Text;
    feature_list: Schema.Attribute.Component<'feature-list.feature-list', true>;
    feature_title: Schema.Attribute.String;
    featured_image: Schema.Attribute.Media<'images'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::all-activity.all-activity'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    slug: Schema.Attribute.String;
    testimonial_video: Schema.Attribute.Media<'videos', true>;
    title: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiAllCourseAllCourse extends Struct.CollectionTypeSchema {
  collectionName: 'all_courses';
  info: {
    displayName: 'All Course';
    pluralName: 'all-courses';
    singularName: 'all-course';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    course: Schema.Attribute.String;
    courses: Schema.Attribute.Relation<'oneToMany', 'api::course.course'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    discount_coupon: Schema.Attribute.Relation<
      'manyToOne',
      'api::discount-coupon.discount-coupon'
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::all-course.all-course'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiAllGradeAllGrade extends Struct.CollectionTypeSchema {
  collectionName: 'all_grades';
  info: {
    displayName: 'All Grade';
    pluralName: 'all-grades';
    singularName: 'all-grade';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    courses: Schema.Attribute.Relation<'oneToMany', 'api::course.course'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    grade: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::all-grade.all-grade'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiBlueprintFormSubmissionBlueprintFormSubmission
  extends Struct.CollectionTypeSchema {
  collectionName: 'blueprint_form_submissions';
  info: {
    displayName: 'Blueprint Form Submissions';
    pluralName: 'blueprint-form-submissions';
    singularName: 'blueprint-form-submission';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    board: Schema.Attribute.String;
    class: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::blueprint-form-submission.blueprint-form-submission'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String;
    pdfSent: Schema.Attribute.Boolean;
    phone: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    whatsapp_number: Schema.Attribute.String;
  };
}

export interface ApiBlueprintPdfBlueprintPdf
  extends Struct.CollectionTypeSchema {
  collectionName: 'blueprint_pdfs';
  info: {
    displayName: 'Blueprint PDF';
    pluralName: 'blueprint-pdfs';
    singularName: 'blueprint-pdf';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    board: Schema.Attribute.Relation<'manyToOne', 'api::board.board'>;
    class: Schema.Attribute.Relation<'manyToOne', 'api::class.class'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::blueprint-pdf.blueprint-pdf'
    > &
      Schema.Attribute.Private;
    pdf: Schema.Attribute.Media<'files'>;
    publishedAt: Schema.Attribute.DateTime;
    title: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiBoardBoard extends Struct.CollectionTypeSchema {
  collectionName: 'boards';
  info: {
    displayName: 'Board';
    pluralName: 'boards';
    singularName: 'board';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    blueprint_pdfs: Schema.Attribute.Relation<
      'oneToMany',
      'api::blueprint-pdf.blueprint-pdf'
    >;
    classes: Schema.Attribute.Relation<'manyToMany', 'api::class.class'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::board.board'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCareerFormCareerForm extends Struct.CollectionTypeSchema {
  collectionName: 'career_forms';
  info: {
    displayName: 'Career Form';
    pluralName: 'career-forms';
    singularName: 'career-form';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    contact_number: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text;
    email: Schema.Attribute.Email;
    full_name: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::career-form.career-form'
    > &
      Schema.Attribute.Private;
    photo_upload: Schema.Attribute.Media<'images'>;
    publishedAt: Schema.Attribute.DateTime;
    resume_upload: Schema.Attribute.Media<'files'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCarrerCarrer extends Struct.SingleTypeSchema {
  collectionName: 'carrers';
  info: {
    displayName: 'Career';
    pluralName: 'carrers';
    singularName: 'carrer';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    career_desc: Schema.Attribute.Text;
    career_img: Schema.Attribute.Media<'images'>;
    career_title: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::carrer.carrer'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    why_join: Schema.Attribute.Component<'why-join.why-join', true>;
    why_join_desc: Schema.Attribute.String;
    why_join_title: Schema.Attribute.String;
  };
}

export interface ApiCartCart extends Struct.CollectionTypeSchema {
  collectionName: 'carts';
  info: {
    displayName: 'cart';
    pluralName: 'carts';
    singularName: 'cart';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    cart_product: Schema.Attribute.Component<'cart-product.cart-product', true>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::cart.cart'> &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users_permissions_user: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiClassClass extends Struct.CollectionTypeSchema {
  collectionName: 'classes';
  info: {
    displayName: 'Class';
    pluralName: 'classes';
    singularName: 'class';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    blueprint_pdfs: Schema.Attribute.Relation<
      'oneToMany',
      'api::blueprint-pdf.blueprint-pdf'
    >;
    boards: Schema.Attribute.Relation<'manyToMany', 'api::board.board'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::class.class'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiContactContact extends Struct.SingleTypeSchema {
  collectionName: 'contacts';
  info: {
    displayName: 'Contact';
    pluralName: 'contacts';
    singularName: 'contact';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    additional_whatsapp_number: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email;
    laneline: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::contact.contact'
    > &
      Schema.Attribute.Private;
    location: Schema.Attribute.String;
    map_location: Schema.Attribute.Text;
    phone: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    whatsapp: Schema.Attribute.String;
  };
}

export interface ApiContactusFormContactusForm
  extends Struct.CollectionTypeSchema {
  collectionName: 'contactus_forms';
  info: {
    displayName: 'Contactus Form';
    pluralName: 'contactus-forms';
    singularName: 'contactus-form';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email;
    full_name: Schema.Attribute.String;
    inquiry_type: Schema.Attribute.Enumeration<
      ['Admissions', 'Support', 'General']
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::contactus-form.contactus-form'
    > &
      Schema.Attribute.Private;
    message: Schema.Attribute.Text;
    phone_number: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    subject: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCookieConsentCookieConsent
  extends Struct.CollectionTypeSchema {
  collectionName: 'cookie_consents';
  info: {
    displayName: 'CookieConsent';
    pluralName: 'cookie-consents';
    singularName: 'cookie-consent';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    consent_type: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    Device: Schema.Attribute.String;
    ip: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::cookie-consent.cookie-consent'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCourseFormCourseForm extends Struct.CollectionTypeSchema {
  collectionName: 'course_forms';
  info: {
    displayName: 'Course Form';
    pluralName: 'course-forms';
    singularName: 'course-form';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    Address: Schema.Attribute.Text;
    City: Schema.Attribute.String;
    class_section: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    Email: Schema.Attribute.String;
    Firstname: Schema.Attribute.String;
    grade: Schema.Attribute.String;
    Lastname: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::course-form.course-form'
    > &
      Schema.Attribute.Private;
    payment_type: Schema.Attribute.String;
    Phone: Schema.Attribute.BigInteger;
    publishedAt: Schema.Attribute.DateTime;
    school_name: Schema.Attribute.String;
    screenshot: Schema.Attribute.Media<'images' | 'files'>;
    State: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    Zipcode: Schema.Attribute.Integer;
  };
}

export interface ApiCourseCourse extends Struct.CollectionTypeSchema {
  collectionName: 'courses';
  info: {
    displayName: 'Course';
    pluralName: 'courses';
    singularName: 'course';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    all_course: Schema.Attribute.Relation<
      'manyToOne',
      'api::all-course.all-course'
    >;
    all_grade: Schema.Attribute.Relation<
      'manyToOne',
      'api::all-grade.all-grade'
    >;
    assessment: Schema.Attribute.Component<'assessment.assessment', true>;
    Brochure: Schema.Attribute.Media;
    course_hours: Schema.Attribute.String;
    course_id: Schema.Attribute.String & Schema.Attribute.Required;
    course_title: Schema.Attribute.String & Schema.Attribute.Required;
    Course_Video_Slider: Schema.Attribute.Component<
      'course-video-slider.course-video-slider',
      true
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    doubt_clearing_sessions: Schema.Attribute.Component<
      'course.course-overview',
      true
    >;
    duration_component: Schema.Attribute.Component<
      'duration.duration-component',
      true
    >;
    featured_image: Schema.Attribute.Media<
      'images' | 'videos' | 'audios' | 'files'
    >;
    fees: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::course.course'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    study_materials: Schema.Attribute.Component<'study.study-materials', true>;
    support: Schema.Attribute.Component<'support.support', true>;
    teaching_methodology: Schema.Attribute.Component<
      'teaching.teaching-methodology',
      true
    >;
    teaching_sessions: Schema.Attribute.Component<
      'sessions.teaching-sessionss',
      true
    >;
    test_assessment: Schema.Attribute.Component<'test.test-assessment', true>;
    Testimonial_Video_Slider: Schema.Attribute.Component<
      'course-testimonial-slider.course-testimonial-slider',
      true
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    why_choose_this_program: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
  };
}

export interface ApiDiscountCouponDiscountCoupon
  extends Struct.CollectionTypeSchema {
  collectionName: 'discount_coupons';
  info: {
    displayName: 'Discount_Coupon';
    pluralName: 'discount-coupons';
    singularName: 'discount-coupon';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    all_courses: Schema.Attribute.Relation<
      'oneToMany',
      'api::all-course.all-course'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    Discount_ID: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    Discount_Type: Schema.Attribute.String;
    Expiry_Date: Schema.Attribute.Date;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::discount-coupon.discount-coupon'
    > &
      Schema.Attribute.Private;
    Max_Spend: Schema.Attribute.BigInteger;
    Min_Spend: Schema.Attribute.BigInteger;
    Overall_cart: Schema.Attribute.Boolean;
    Price: Schema.Attribute.BigInteger;
    products: Schema.Attribute.Relation<'oneToMany', 'api::product.product'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    Usage_Limit: Schema.Attribute.Integer;
  };
}

export interface ApiEnquiryFormEnquiryForm extends Struct.CollectionTypeSchema {
  collectionName: 'enquiry_forms';
  info: {
    displayName: 'Enquiry form';
    pluralName: 'enquiry-forms';
    singularName: 'enquiry-form';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email;
    enquiry_type: Schema.Attribute.String;
    full_name: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::enquiry-form.enquiry-form'
    > &
      Schema.Attribute.Private;
    message: Schema.Attribute.Text;
    phone_number: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiGalleryTypeGalleryType extends Struct.CollectionTypeSchema {
  collectionName: 'gallery_types';
  info: {
    displayName: 'Gallery_type';
    pluralName: 'gallery-types';
    singularName: 'gallery-type';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    gallery_type: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::gallery-type.gallery-type'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiGalleryGallery extends Struct.CollectionTypeSchema {
  collectionName: 'galleries';
  info: {
    displayName: 'Gallery';
    pluralName: 'galleries';
    singularName: 'gallery';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    gallery_type: Schema.Attribute.Relation<
      'oneToOne',
      'api::gallery-type.gallery-type'
    >;
    image: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::gallery.gallery'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiHomeHome extends Struct.SingleTypeSchema {
  collectionName: 'homes';
  info: {
    displayName: 'Home';
    pluralName: 'homes';
    singularName: 'home';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    activity_section: Schema.Attribute.Component<'resourse.resource', true>;
    course_content: Schema.Attribute.Component<
      'course-content.course-content',
      true
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    hero_description: Schema.Attribute.Text;
    hero_section: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    hero_title: Schema.Attribute.String & Schema.Attribute.Required;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::home.home'> &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    science_of_living_section: Schema.Attribute.Component<'desc.data', true>;
    subtitle: Schema.Attribute.Component<'subtitle.sub-title', true>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    why_aurogurukul_bg: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    why_aurogurukul_desc: Schema.Attribute.Text;
  };
}

export interface ApiLandingPageLandingPage extends Struct.SingleTypeSchema {
  collectionName: 'landing_pages';
  info: {
    displayName: 'landing-page';
    pluralName: 'landing-pages';
    singularName: 'landing-page';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    Admission_heading: Schema.Attribute.Text;
    Admission_steps: Schema.Attribute.Component<
      'admission-steps.admission-steps',
      true
    >;
    Admission_subheading: Schema.Attribute.Text;
    branch_description: Schema.Attribute.Text;
    branch_heading: Schema.Attribute.String;
    branch_subheading: Schema.Attribute.Text;
    checklist: Schema.Attribute.Component<'checklist.checklist', true>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    families_description: Schema.Attribute.Text;
    Families_image1: Schema.Attribute.Media<'images'>;
    Families_image2: Schema.Attribute.Media<'images'>;
    Families_points: Schema.Attribute.Component<
      'families-points.families-points',
      true
    >;
    faq: Schema.Attribute.Component<'faq.faq', true>;
    features: Schema.Attribute.Component<'features.features', true>;
    features_description: Schema.Attribute.Text;
    features_image: Schema.Attribute.Media<'images'>;
    form_addres: Schema.Attribute.String;
    form_heading: Schema.Attribute.Text;
    form_mail: Schema.Attribute.String;
    form_number: Schema.Attribute.String;
    form_subheading: Schema.Attribute.Text;
    headline: Schema.Attribute.String;
    headline2: Schema.Attribute.String;
    hero_image: Schema.Attribute.Media<'images'>;
    Human_advantage: Schema.Attribute.Component<
      'human-advantage.human-advantage',
      true
    >;
    human_advantage_headline: Schema.Attribute.Text;
    human_advantage_subheadline: Schema.Attribute.Text;
    JEE_track: Schema.Attribute.Component<'jee-track.jee-track', true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::landing-page.landing-page'
    > &
      Schema.Attribute.Private;
    NEET_track: Schema.Attribute.Component<'neet-track.neet-track', true>;
    offer: Schema.Attribute.String;
    offer_description: Schema.Attribute.Text;
    offer_heading: Schema.Attribute.Text;
    offer_points: Schema.Attribute.Component<'offer-points.offer-points', true>;
    Offline_description: Schema.Attribute.Text;
    offline_points: Schema.Attribute.Component<
      'offline-points.offline-points',
      true
    >;
    online_description: Schema.Attribute.Text;
    online_points: Schema.Attribute.Component<
      'online-points.online-points',
      true
    >;
    pondicherry_center: Schema.Attribute.Text;
    preparation_cards: Schema.Attribute.Component<
      'preparation-cards.preparation-cards',
      true
    >;
    preparation_heading: Schema.Attribute.Text;
    preparation_subheading: Schema.Attribute.Text;
    publishedAt: Schema.Attribute.DateTime;
    smart_preparation: Schema.Attribute.Component<
      'smart-preparation.smart-preparation',
      true
    >;
    smart_preparation_headline: Schema.Attribute.Text;
    smart_preparation_subheadline: Schema.Attribute.Text;
    Study_heading: Schema.Attribute.Text;
    study_offline: Schema.Attribute.Component<
      'study-offline.study-offline',
      true
    >;
    study_online: Schema.Attribute.Component<'study-online.study-online', true>;
    Study_subheading: Schema.Attribute.Text;
    Subheadline: Schema.Attribute.Text;
    Testimonials: Schema.Attribute.Component<'testimonials.testimonials', true>;
    tracks_heading: Schema.Attribute.String;
    tracks_subheading: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    urgency_line: Schema.Attribute.Text;
  };
}

export interface ApiOrderOrder extends Struct.CollectionTypeSchema {
  collectionName: 'orders';
  info: {
    displayName: 'Order';
    pluralName: 'orders';
    singularName: 'order';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    Billing_Address: Schema.Attribute.Component<
      'billing-address.billing-address',
      false
    >;
    Coupons: Schema.Attribute.Component<'coupons.coupons', false>;
    Course_Item: Schema.Attribute.Component<'course-item.course-item', false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    Date: Schema.Attribute.Date;
    Invoice: Schema.Attribute.Component<'invoice.invoice', false>;
    InvoiceNumber: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::order.order'> &
      Schema.Attribute.Private;
    Order_ID: Schema.Attribute.UID;
    order_status: Schema.Attribute.Enumeration<
      ['pending', 'success', 'failed']
    >;
    order_type: Schema.Attribute.Enumeration<['checkout', 'direct_enrollment']>;
    Payment_Status: Schema.Attribute.Boolean;
    PhonePe_Order_Id: Schema.Attribute.String;
    Price: Schema.Attribute.String;
    Product_Item: Schema.Attribute.Component<'product-item.product-item', true>;
    publishedAt: Schema.Attribute.DateTime;
    receipt: Schema.Attribute.Media<'files'>;
    Shipping_Address: Schema.Attribute.Component<
      'shipping-address.shipping-address',
      false
    >;
    terms: Schema.Attribute.Boolean;
    Transaction_Id: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users_permissions_user: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiOtpOtp extends Struct.CollectionTypeSchema {
  collectionName: 'otps';
  info: {
    displayName: 'Otp';
    pluralName: 'otps';
    singularName: 'otp';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    code: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.String;
    isUsed: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::otp.otp'> &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiPartialPaymentCoursePartialPaymentCourse
  extends Struct.CollectionTypeSchema {
  collectionName: 'partial_payment_courses';
  info: {
    displayName: 'Partial Payment Course';
    pluralName: 'partial-payment-courses';
    singularName: 'partial-payment-course';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    Course_Name: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::partial-payment-course.partial-payment-course'
    > &
      Schema.Attribute.Private;
    Price: Schema.Attribute.Integer;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiPincodeMasterPincodeMaster
  extends Struct.CollectionTypeSchema {
  collectionName: 'pincode_masters';
  info: {
    displayName: 'Pincode_Master';
    pluralName: 'pincode-masters';
    singularName: 'pincode-master';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    District: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::pincode-master.pincode-master'
    > &
      Schema.Attribute.Private;
    Pincode: Schema.Attribute.String & Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    State: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    Zone_Tag: Schema.Attribute.String;
  };
}

export interface ApiProductCategoryProductCategory
  extends Struct.CollectionTypeSchema {
  collectionName: 'product_categories';
  info: {
    displayName: 'Product_Category';
    pluralName: 'product-categories';
    singularName: 'product-category';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    category_name: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::product-category.product-category'
    > &
      Schema.Attribute.Private;
    products: Schema.Attribute.Relation<'oneToMany', 'api::product.product'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiProductProduct extends Struct.CollectionTypeSchema {
  collectionName: 'products';
  info: {
    displayName: 'Product';
    pluralName: 'products';
    singularName: 'product';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    all_resource: Schema.Attribute.Relation<
      'manyToOne',
      'api::resource.resource'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    Description: Schema.Attribute.Text;
    description_image: Schema.Attribute.Media<'images', true>;
    description_points: Schema.Attribute.Component<
      'description-points.description-points',
      true
    >;
    description_video: Schema.Attribute.Media<'videos', true>;
    discount_coupon: Schema.Attribute.Relation<
      'manyToOne',
      'api::discount-coupon.discount-coupon'
    >;
    Download_Catalogue: Schema.Attribute.Media<'images' | 'files'>;
    Image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::product.product'
    > &
      Schema.Attribute.Private;
    Price: Schema.Attribute.String;
    product_category: Schema.Attribute.Relation<
      'manyToOne',
      'api::product-category.product-category'
    >;
    Product_Id: Schema.Attribute.UID<'Title'> & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    resource_highlights: Schema.Attribute.Component<
      'resource-highlights.resource-highlights',
      true
    >;
    reviews: Schema.Attribute.Relation<'oneToMany', 'api::review.review'>;
    short_description: Schema.Attribute.Text;
    Testimonials_videos: Schema.Attribute.Media<'videos', true>;
    Title: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    video: Schema.Attribute.Media<'videos'>;
  };
}

export interface ApiResourceResource extends Struct.CollectionTypeSchema {
  collectionName: 'resources';
  info: {
    displayName: 'All Resource';
    pluralName: 'resources';
    singularName: 'resource';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text;
    featured_img: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    link: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::resource.resource'
    > &
      Schema.Attribute.Private;
    products: Schema.Attribute.Relation<'oneToMany', 'api::product.product'>;
    publishedAt: Schema.Attribute.DateTime;
    resource_id: Schema.Attribute.UID<'resource_title'>;
    resource_title: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiReviewReview extends Struct.CollectionTypeSchema {
  collectionName: 'reviews';
  info: {
    displayName: 'Review';
    pluralName: 'reviews';
    singularName: 'review';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    comment: Schema.Attribute.Text;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::review.review'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    rating: Schema.Attribute.Integer;
    review: Schema.Attribute.Relation<'manyToOne', 'api::product.product'>;
    time: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.String;
  };
}

export interface ApiSchoolProjectSchoolProject extends Struct.SingleTypeSchema {
  collectionName: 'school_projects';
  info: {
    displayName: 'school_project';
    pluralName: 'school-projects';
    singularName: 'school-project';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text;
    hero_desc: Schema.Attribute.Text;
    hero_image: Schema.Attribute.Media<'images'>;
    hero_title: Schema.Attribute.String;
    integral_education: Schema.Attribute.Component<
      'integral-education.school-integral-education',
      false
    >;
    integrated_programs: Schema.Attribute.Component<
      'integrated-programs.integrated-programs',
      true
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::school-project.school-project'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiScienceOfLivingScienceOfLiving
  extends Struct.SingleTypeSchema {
  collectionName: 'science_of_livings';
  info: {
    displayName: 'Science of living';
    pluralName: 'science-of-livings';
    singularName: 'science-of-living';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    Description: Schema.Attribute.Text;
    Discipline_section_description: Schema.Attribute.Text;
    featured_list: Schema.Attribute.Component<
      'featured-list.featured-list',
      true
    >;
    Hero_background_image: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    Journey_of_self_discovery: Schema.Attribute.Text;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::science-of-living.science-of-living'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    quote: Schema.Attribute.Component<'sciencequote.quote', false>;
    Title: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiShippingRuleShippingRule
  extends Struct.CollectionTypeSchema {
  collectionName: 'shipping_rules';
  info: {
    displayName: 'Shipping Rule';
    pluralName: 'shipping-rules';
    singularName: 'shipping-rule';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    Free_Shipping: Schema.Attribute.Boolean;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::shipping-rule.shipping-rule'
    > &
      Schema.Attribute.Private;
    Min_Order_Value: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    shipping_fee: Schema.Attribute.String;
    Shipping_Method: Schema.Attribute.Enumeration<['Shipping Method']>;
    state_shipping: Schema.Attribute.Boolean;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiShippingShipping extends Struct.CollectionTypeSchema {
  collectionName: 'shippings';
  info: {
    displayName: 'Shipping';
    pluralName: 'shippings';
    singularName: 'shipping';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    Courier_Partner: Schema.Attribute.Enumeration<
      ['BlueDart', 'Delhivery', 'XpressBees', 'EcomExpress', 'Shadowfax']
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    Estimated_Delivery: Schema.Attribute.DateTime;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::shipping.shipping'
    > &
      Schema.Attribute.Private;
    Order_ID: Schema.Attribute.String;
    Order_Status: Schema.Attribute.Enumeration<
      [
        'Pending',
        'Processing',
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Cancelled',
        'Returned',
        'Failed',
        'Refunded',
      ]
    >;
    Product: Schema.Attribute.Component<'product-item.product-item', true>;
    publishedAt: Schema.Attribute.DateTime;
    Shipping_Cost: Schema.Attribute.BigInteger;
    Shipping_ID: Schema.Attribute.String & Schema.Attribute.Unique;
    Shipping_Method: Schema.Attribute.Enumeration<
      ['Standard', 'Express', 'Same-Day', 'Free Shipping', 'Pickup']
    >;
    Total_price: Schema.Attribute.String;
    Tracking_Number: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users_permissions_user: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    Zip_Code: Schema.Attribute.String;
  };
}

export interface ApiSkillDevelopmentFormSkillDevelopmentForm
  extends Struct.CollectionTypeSchema {
  collectionName: 'skill_development_forms';
  info: {
    displayName: 'Skill Development Form';
    pluralName: 'skill-development-forms';
    singularName: 'skill-development-form';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    city: Schema.Attribute.String;
    course: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email;
    full_name: Schema.Attribute.String;
    grade: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::skill-development-form.skill-development-form'
    > &
      Schema.Attribute.Private;
    payment_type: Schema.Attribute.String;
    phone_number: Schema.Attribute.BigInteger;
    publishedAt: Schema.Attribute.DateTime;
    school_name: Schema.Attribute.String;
    screenshot: Schema.Attribute.Media<'images'>;
    state: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiSkillDevelopmentSkillDevelopment
  extends Struct.SingleTypeSchema {
  collectionName: 'skill_developments';
  info: {
    displayName: 'Skill_development';
    pluralName: 'skill-developments';
    singularName: 'skill-development';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    about_program: Schema.Attribute.Component<
      'about-program.about-program',
      true
    >;
    about_program_desc: Schema.Attribute.Text;
    about_program_img: Schema.Attribute.Media<'images'>;
    course_duration: Schema.Attribute.String;
    course_fee: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    highlight: Schema.Attribute.Component<'highlight.highlight', true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::skill-development.skill-development'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    skill_development: Schema.Attribute.Component<
      'skill-development.skill-development',
      true
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiSocialLinkSocialLink extends Struct.SingleTypeSchema {
  collectionName: 'social_links';
  info: {
    displayName: 'Social_link';
    pluralName: 'social-links';
    singularName: 'social-link';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    facebook: Schema.Attribute.String;
    insagram: Schema.Attribute.String;
    linkedin: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::social-link.social-link'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    twitter: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    youtube: Schema.Attribute.String;
  };
}

export interface ApiStateShippingRuleStateShippingRule
  extends Struct.CollectionTypeSchema {
  collectionName: 'state_shipping_rules';
  info: {
    displayName: 'State_Shipping_Rule';
    pluralName: 'state-shipping-rules';
    singularName: 'state-shipping-rule';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    availability: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    Estimated_Days: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::state-shipping-rule.state-shipping-rule'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    Shipping_Cost: Schema.Attribute.String;
    State_Name: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiWishlistWishlist extends Struct.CollectionTypeSchema {
  collectionName: 'wishlists';
  info: {
    displayName: 'Wishlist';
    pluralName: 'wishlists';
    singularName: 'wishlist';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::wishlist.wishlist'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users_permissions_user: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    wishlist: Schema.Attribute.Component<'wishlist.wishlist', true>;
  };
}

export interface PluginContentReleasesRelease
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_releases';
  info: {
    displayName: 'Release';
    pluralName: 'releases';
    singularName: 'release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    actions: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    releasedAt: Schema.Attribute.DateTime;
    scheduledAt: Schema.Attribute.DateTime;
    status: Schema.Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Schema.Attribute.Required;
    timezone: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_release_actions';
  info: {
    displayName: 'Release Action';
    pluralName: 'release-actions';
    singularName: 'release-action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentType: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    entryDocumentId: Schema.Attribute.String;
    isEntryValid: Schema.Attribute.Boolean;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release-action'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    release: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::content-releases.release'
    >;
    type: Schema.Attribute.Enumeration<['publish', 'unpublish']> &
      Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginI18NLocale extends Struct.CollectionTypeSchema {
  collectionName: 'i18n_locale';
  info: {
    collectionName: 'locales';
    description: '';
    displayName: 'Locale';
    pluralName: 'locales';
    singularName: 'locale';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Schema.Attribute.String & Schema.Attribute.Unique;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::i18n.locale'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.SetMinMax<
        {
          max: 50;
          min: 1;
        },
        number
      >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginReviewWorkflowsWorkflow
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows';
  info: {
    description: '';
    displayName: 'Workflow';
    name: 'Workflow';
    pluralName: 'workflows';
    singularName: 'workflow';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentTypes: Schema.Attribute.JSON &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'[]'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    stageRequiredToPublish: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::review-workflows.workflow-stage'
    >;
    stages: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow-stage'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginReviewWorkflowsWorkflowStage
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows_stages';
  info: {
    description: '';
    displayName: 'Stages';
    name: 'Workflow Stage';
    pluralName: 'workflow-stages';
    singularName: 'workflow-stage';
  };
  options: {
    draftAndPublish: false;
    version: '1.1.0';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    color: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#4945FF'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow-stage'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String;
    permissions: Schema.Attribute.Relation<'manyToMany', 'admin::permission'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    workflow: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::review-workflows.workflow'
    >;
  };
}

export interface PluginUploadFile extends Struct.CollectionTypeSchema {
  collectionName: 'files';
  info: {
    description: '';
    displayName: 'File';
    pluralName: 'files';
    singularName: 'file';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    alternativeText: Schema.Attribute.String;
    caption: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    ext: Schema.Attribute.String;
    folder: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'> &
      Schema.Attribute.Private;
    folderPath: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    formats: Schema.Attribute.JSON;
    hash: Schema.Attribute.String & Schema.Attribute.Required;
    height: Schema.Attribute.Integer;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::upload.file'
    > &
      Schema.Attribute.Private;
    mime: Schema.Attribute.String & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    previewUrl: Schema.Attribute.String;
    provider: Schema.Attribute.String & Schema.Attribute.Required;
    provider_metadata: Schema.Attribute.JSON;
    publishedAt: Schema.Attribute.DateTime;
    related: Schema.Attribute.Relation<'morphToMany'>;
    size: Schema.Attribute.Decimal & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url: Schema.Attribute.String & Schema.Attribute.Required;
    width: Schema.Attribute.Integer;
  };
}

export interface PluginUploadFolder extends Struct.CollectionTypeSchema {
  collectionName: 'upload_folders';
  info: {
    displayName: 'Folder';
    pluralName: 'folders';
    singularName: 'folder';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    children: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.folder'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    files: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.file'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::upload.folder'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    parent: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'>;
    path: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    pathId: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'role';
    pluralName: 'roles';
    singularName: 'role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.role'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    type: Schema.Attribute.String & Schema.Attribute.Unique;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.user'
    >;
  };
}

export interface PluginUsersPermissionsUser
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'user';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    address: Schema.Attribute.String;
    blocked: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    city: Schema.Attribute.String;
    confirmationToken: Schema.Attribute.String & Schema.Attribute.Private;
    confirmed: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.user'
    > &
      Schema.Attribute.Private;
    Order_History: Schema.Attribute.Component<
      'order-history.order-history',
      false
    >;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    Phone: Schema.Attribute.String;
    Profile_Picture: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    provider: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    role: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    state: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    username: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    Verified: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    Website: Schema.Attribute.String;
    wishlists: Schema.Attribute.Relation<'oneToMany', 'api::wishlist.wishlist'>;
    zip_code: Schema.Attribute.Integer;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ContentTypeSchemas {
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::permission': AdminPermission;
      'admin::role': AdminRole;
      'admin::session': AdminSession;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'admin::user': AdminUser;
      'api::about.about': ApiAboutAbout;
      'api::activity-form.activity-form': ApiActivityFormActivityForm;
      'api::activity.activity': ApiActivityActivity;
      'api::all-activity.all-activity': ApiAllActivityAllActivity;
      'api::all-course.all-course': ApiAllCourseAllCourse;
      'api::all-grade.all-grade': ApiAllGradeAllGrade;
      'api::blueprint-form-submission.blueprint-form-submission': ApiBlueprintFormSubmissionBlueprintFormSubmission;
      'api::blueprint-pdf.blueprint-pdf': ApiBlueprintPdfBlueprintPdf;
      'api::board.board': ApiBoardBoard;
      'api::career-form.career-form': ApiCareerFormCareerForm;
      'api::carrer.carrer': ApiCarrerCarrer;
      'api::cart.cart': ApiCartCart;
      'api::class.class': ApiClassClass;
      'api::contact.contact': ApiContactContact;
      'api::contactus-form.contactus-form': ApiContactusFormContactusForm;
      'api::cookie-consent.cookie-consent': ApiCookieConsentCookieConsent;
      'api::course-form.course-form': ApiCourseFormCourseForm;
      'api::course.course': ApiCourseCourse;
      'api::discount-coupon.discount-coupon': ApiDiscountCouponDiscountCoupon;
      'api::enquiry-form.enquiry-form': ApiEnquiryFormEnquiryForm;
      'api::gallery-type.gallery-type': ApiGalleryTypeGalleryType;
      'api::gallery.gallery': ApiGalleryGallery;
      'api::home.home': ApiHomeHome;
      'api::landing-page.landing-page': ApiLandingPageLandingPage;
      'api::order.order': ApiOrderOrder;
      'api::otp.otp': ApiOtpOtp;
      'api::partial-payment-course.partial-payment-course': ApiPartialPaymentCoursePartialPaymentCourse;
      'api::pincode-master.pincode-master': ApiPincodeMasterPincodeMaster;
      'api::product-category.product-category': ApiProductCategoryProductCategory;
      'api::product.product': ApiProductProduct;
      'api::resource.resource': ApiResourceResource;
      'api::review.review': ApiReviewReview;
      'api::school-project.school-project': ApiSchoolProjectSchoolProject;
      'api::science-of-living.science-of-living': ApiScienceOfLivingScienceOfLiving;
      'api::shipping-rule.shipping-rule': ApiShippingRuleShippingRule;
      'api::shipping.shipping': ApiShippingShipping;
      'api::skill-development-form.skill-development-form': ApiSkillDevelopmentFormSkillDevelopmentForm;
      'api::skill-development.skill-development': ApiSkillDevelopmentSkillDevelopment;
      'api::social-link.social-link': ApiSocialLinkSocialLink;
      'api::state-shipping-rule.state-shipping-rule': ApiStateShippingRuleStateShippingRule;
      'api::wishlist.wishlist': ApiWishlistWishlist;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::i18n.locale': PluginI18NLocale;
      'plugin::review-workflows.workflow': PluginReviewWorkflowsWorkflow;
      'plugin::review-workflows.workflow-stage': PluginReviewWorkflowsWorkflowStage;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
    }
  }
}
