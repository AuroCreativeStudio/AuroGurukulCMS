import type { Schema, Struct } from '@strapi/strapi';

export interface AboutProgramAboutProgram extends Struct.ComponentSchema {
  collectionName: 'components_about_program_about_programs';
  info: {
    displayName: 'about_program';
  };
  attributes: {
    about_program_list: Schema.Attribute.String;
  };
}

export interface ActivityActivityList extends Struct.ComponentSchema {
  collectionName: 'components_activity_activity_lists';
  info: {
    displayName: 'activity-list';
  };
  attributes: {
    activity_icon: Schema.Attribute.Media<'images'>;
    activity_title: Schema.Attribute.String;
    featured_image: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    slug: Schema.Attribute.String;
  };
}

export interface AssessmentAssessment extends Struct.ComponentSchema {
  collectionName: 'components_assessment_assessments';
  info: {
    displayName: 'assessment';
  };
  attributes: {
    assessment_icons: Schema.Attribute.Media<'images'>;
    assessment_text: Schema.Attribute.String;
  };
}

export interface CourseContentCourseContent extends Struct.ComponentSchema {
  collectionName: 'components_course_content_course_contents';
  info: {
    displayName: 'course_content';
  };
  attributes: {
    course_img: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    course_mobile_img: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    link: Schema.Attribute.String;
  };
}

export interface CourseListCourseList extends Struct.ComponentSchema {
  collectionName: 'components_course_list_course_lists';
  info: {
    displayName: 'course-list';
  };
  attributes: {
    course_list: Schema.Attribute.Component<'courses.course-list', true>;
    course_title: Schema.Attribute.String;
    course_video: Schema.Attribute.Media<'videos'>;
  };
}

export interface CourseCourseOverview extends Struct.ComponentSchema {
  collectionName: 'components_course_course_overviews';
  info: {
    displayName: 'course-overview';
  };
  attributes: {
    doubt_clearing: Schema.Attribute.String;
  };
}

export interface CoursesCourseList extends Struct.ComponentSchema {
  collectionName: 'components_courses_course_lists';
  info: {
    displayName: 'course-list';
  };
  attributes: {
    course_list: Schema.Attribute.String;
  };
}

export interface CurriculamCurriculam extends Struct.ComponentSchema {
  collectionName: 'components_curriculam_curriculams';
  info: {
    displayName: 'curriculam';
  };
  attributes: {
    description1: Schema.Attribute.Text;
    description2: Schema.Attribute.String;
    feature: Schema.Attribute.Component<'feature.feature', true>;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    title: Schema.Attribute.String;
  };
}

export interface DescData extends Struct.ComponentSchema {
  collectionName: 'components_desc_data';
  info: {
    displayName: 'data';
  };
  attributes: {
    scienceof_living: Schema.Attribute.Text;
  };
}

export interface DurationDurationComponent extends Struct.ComponentSchema {
  collectionName: 'components_duration_duration_components';
  info: {
    displayName: 'duration_component';
  };
  attributes: {
    duration: Schema.Attribute.String;
    duration_icon: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
  };
}

export interface FeatureListFeatureList extends Struct.ComponentSchema {
  collectionName: 'components_feature_list_feature_lists';
  info: {
    displayName: 'feature-list';
  };
  attributes: {
    feature_list: Schema.Attribute.String;
  };
}

export interface FeatureFeature extends Struct.ComponentSchema {
  collectionName: 'components_feature_features';
  info: {
    displayName: 'feature';
  };
  attributes: {
    content: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
  };
}

export interface FeaturedListFeaturedList extends Struct.ComponentSchema {
  collectionName: 'components_featured_list_featured_lists';
  info: {
    displayName: 'featured-list';
  };
  attributes: {
    Description: Schema.Attribute.Text;
    Icon: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    Title: Schema.Attribute.String;
  };
}

export interface HighlightHighlight extends Struct.ComponentSchema {
  collectionName: 'components_highlight_highlights';
  info: {
    displayName: 'highlight';
  };
  attributes: {
    highlight_desc: Schema.Attribute.Text;
    highlight_icons: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
  };
}

export interface IntegralEducationIntegralEducation
  extends Struct.ComponentSchema {
  collectionName: 'components_integral_education_integral_educations';
  info: {
    displayName: 'integral_education';
  };
  attributes: {
    integral_desc: Schema.Attribute.Text;
    integral_title: Schema.Attribute.String;
  };
}

export interface ListActivityList extends Struct.ComponentSchema {
  collectionName: 'components_list_activity_lists';
  info: {
    displayName: 'activity-list';
  };
  attributes: {
    description: Schema.Attribute.String;
  };
}

export interface MembersTeam extends Struct.ComponentSchema {
  collectionName: 'components_members_teams';
  info: {
    displayName: 'team';
  };
  attributes: {
    team_description: Schema.Attribute.Text;
    team_designation: Schema.Attribute.String;
    team_img: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    team_name: Schema.Attribute.String;
  };
}

export interface QuoteQuote extends Struct.ComponentSchema {
  collectionName: 'components_quote_quotes';
  info: {
    displayName: 'quote';
  };
  attributes: {
    quote_desc: Schema.Attribute.Text;
    quote_img: Schema.Attribute.Media<'images'>;
  };
}

export interface ResourseResource extends Struct.ComponentSchema {
  collectionName: 'components_resourse_resources';
  info: {
    displayName: 'resource';
  };
  attributes: {
    activity_content: Schema.Attribute.String;
    activity_img: Schema.Attribute.Media<'images'>;
    link: Schema.Attribute.String;
  };
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

export interface SciencequoteQuote extends Struct.ComponentSchema {
  collectionName: 'components_sciencequote_quotes';
  info: {
    displayName: 'quote';
  };
  attributes: {
    Quote_author: Schema.Attribute.String;
    Quote_title: Schema.Attribute.String;
  };
}

export interface SessionsTeachingSessions extends Struct.ComponentSchema {
  collectionName: 'components_sessions_teaching_sessions';
  info: {
    displayName: 'teaching_sessions';
  };
  attributes: {};
}

export interface SessionsTeachingSessionss extends Struct.ComponentSchema {
  collectionName: 'components_sessions_teaching_sessionsses';
  info: {
    displayName: 'teaching_sessionss';
  };
  attributes: {
    teaching_sessions: Schema.Attribute.String;
  };
}

export interface SkillDevelopmentSkillDevelopment
  extends Struct.ComponentSchema {
  collectionName: 'components_skill_development_skill_developments';
  info: {
    displayName: 'skill_development';
  };
  attributes: {
    skill_list: Schema.Attribute.Component<'skill-list.skill-list', true>;
    title: Schema.Attribute.String;
  };
}

export interface SkillListSkillList extends Struct.ComponentSchema {
  collectionName: 'components_skill_list_skill_lists';
  info: {
    displayName: 'skill-list';
  };
  attributes: {
    points: Schema.Attribute.String;
  };
}

export interface StudyStudyMaterials extends Struct.ComponentSchema {
  collectionName: 'components_study_study_materials';
  info: {
    displayName: 'study_materials';
  };
  attributes: {
    study_material: Schema.Attribute.String;
  };
}

export interface SubtitleSubTitle extends Struct.ComponentSchema {
  collectionName: 'components_subtitle_sub_titles';
  info: {
    displayName: 'sub_title';
  };
  attributes: {
    hero_subtitle: Schema.Attribute.String;
  };
}

export interface SubtitleSubtitle extends Struct.ComponentSchema {
  collectionName: 'components_subtitle_subtitles';
  info: {
    displayName: 'subtitle';
  };
  attributes: {};
}

export interface SupportSupport extends Struct.ComponentSchema {
  collectionName: 'components_support_supports';
  info: {
    displayName: 'support';
  };
  attributes: {
    support_icon: Schema.Attribute.Media<'images'>;
    support_text: Schema.Attribute.String;
  };
}

export interface TeachingTeachingMethodology extends Struct.ComponentSchema {
  collectionName: 'components_teaching_teaching_methodologies';
  info: {
    displayName: 'teaching_methodology';
  };
  attributes: {
    methodology: Schema.Attribute.String;
  };
}

export interface TestTestAssessment extends Struct.ComponentSchema {
  collectionName: 'components_test_test_assessments';
  info: {
    displayName: 'test_assessment';
  };
  attributes: {
    test_assessment: Schema.Attribute.String;
  };
}

export interface WhyJoinWhyJoin extends Struct.ComponentSchema {
  collectionName: 'components_why_join_why_joins';
  info: {
    displayName: 'why_join';
  };
  attributes: {
    why_join_list: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'about-program.about-program': AboutProgramAboutProgram;
      'activity.activity-list': ActivityActivityList;
      'assessment.assessment': AssessmentAssessment;
      'course-content.course-content': CourseContentCourseContent;
      'course-list.course-list': CourseListCourseList;
      'course.course-overview': CourseCourseOverview;
      'courses.course-list': CoursesCourseList;
      'curriculam.curriculam': CurriculamCurriculam;
      'desc.data': DescData;
      'duration.duration-component': DurationDurationComponent;
      'feature-list.feature-list': FeatureListFeatureList;
      'feature.feature': FeatureFeature;
      'featured-list.featured-list': FeaturedListFeaturedList;
      'highlight.highlight': HighlightHighlight;
      'integral-education.integral-education': IntegralEducationIntegralEducation;
      'list.activity-list': ListActivityList;
      'members.team': MembersTeam;
      'quote.quote': QuoteQuote;
      'resourse.resource': ResourseResource;
      'sample.sampledata': SampleSampledata;
      'sciencequote.quote': SciencequoteQuote;
      'sessions.teaching-sessions': SessionsTeachingSessions;
      'sessions.teaching-sessionss': SessionsTeachingSessionss;
      'skill-development.skill-development': SkillDevelopmentSkillDevelopment;
      'skill-list.skill-list': SkillListSkillList;
      'study.study-materials': StudyStudyMaterials;
      'subtitle.sub-title': SubtitleSubTitle;
      'subtitle.subtitle': SubtitleSubtitle;
      'support.support': SupportSupport;
      'teaching.teaching-methodology': TeachingTeachingMethodology;
      'test.test-assessment': TestTestAssessment;
      'why-join.why-join': WhyJoinWhyJoin;
    }
  }
}
