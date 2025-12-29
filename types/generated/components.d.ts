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

export interface AdmissionStepsAdmissionSteps extends Struct.ComponentSchema {
  collectionName: 'components_admission_steps_admission_steps';
  info: {
    displayName: 'Admission_steps';
  };
  attributes: {
    description: Schema.Attribute.Text;
    title: Schema.Attribute.Text;
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

export interface BillingAddressBillingAddress extends Struct.ComponentSchema {
  collectionName: 'components_billing_address_billing_addresses';
  info: {
    displayName: 'Billing_Address';
  };
  attributes: {
    Address: Schema.Attribute.Text;
    City: Schema.Attribute.String;
    Email: Schema.Attribute.Email;
    Firstname: Schema.Attribute.String;
    Lastname: Schema.Attribute.String;
    Phone: Schema.Attribute.String;
    State: Schema.Attribute.String;
    Zipcode: Schema.Attribute.String;
  };
}

export interface CartProductCartProduct extends Struct.ComponentSchema {
  collectionName: 'components_cart_product_cart_products';
  info: {
    displayName: 'cart-product';
  };
  attributes: {
    products: Schema.Attribute.Relation<'oneToMany', 'api::product.product'>;
    Quantity: Schema.Attribute.Integer;
  };
}

export interface ChecklistChecklist extends Struct.ComponentSchema {
  collectionName: 'components_checklist_checklists';
  info: {
    displayName: 'checklist';
  };
  attributes: {
    checklist: Schema.Attribute.String;
  };
}

export interface CouponsCoupons extends Struct.ComponentSchema {
  collectionName: 'components_coupons_coupons';
  info: {
    displayName: 'Coupons';
  };
  attributes: {};
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

export interface CourseItemCourseItem extends Struct.ComponentSchema {
  collectionName: 'components_course_item_course_items';
  info: {
    displayName: 'Course_Item';
  };
  attributes: {
    Class: Schema.Attribute.String;
    Course_Fees: Schema.Attribute.String;
    Course_Id: Schema.Attribute.String;
    Course_Title: Schema.Attribute.String;
    School: Schema.Attribute.String;
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

export interface CourseTestimonialSliderCourseTestimonialSlider
  extends Struct.ComponentSchema {
  collectionName: 'components_course_testimonial_slider_course_testimonial_sliders';
  info: {
    displayName: 'course_testimonial_slider';
  };
  attributes: {
    Content: Schema.Attribute.String;
    Video: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
  };
}

export interface CourseVideoSliderCourseVideoSlider
  extends Struct.ComponentSchema {
  collectionName: 'components_course_video_slider_course_video_sliders';
  info: {
    displayName: 'course__video_slider';
  };
  attributes: {
    Content: Schema.Attribute.String;
    Video: Schema.Attribute.Media<'images' | 'videos' | 'audios' | 'files'>;
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
    link: Schema.Attribute.String;
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

export interface FamiliesPointsFamiliesPoints extends Struct.ComponentSchema {
  collectionName: 'components_families_points_families_points';
  info: {
    displayName: 'Families_points';
  };
  attributes: {
    Families_points: Schema.Attribute.Text;
  };
}

export interface FaqFaq extends Struct.ComponentSchema {
  collectionName: 'components_faq_faqs';
  info: {
    displayName: 'faq';
  };
  attributes: {
    answer: Schema.Attribute.Text;
    question: Schema.Attribute.Text;
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

export interface FeaturesFeatures extends Struct.ComponentSchema {
  collectionName: 'components_features_features';
  info: {
    displayName: 'features';
  };
  attributes: {
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String;
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

export interface IntegralEducationSchoolIntegralEducation
  extends Struct.ComponentSchema {
  collectionName: 'components_integral_education_school_integral_educations';
  info: {
    displayName: 'school_integral_education';
  };
  attributes: {
    description: Schema.Attribute.Text;
    list_1: Schema.Attribute.Text;
    list_2: Schema.Attribute.Text;
    list_3: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface IntegratedProgramsIntegratedPrograms
  extends Struct.ComponentSchema {
  collectionName: 'components_integrated_programs_integrated_programs';
  info: {
    displayName: 'integrated_programs';
  };
  attributes: {
    description: Schema.Attribute.Text;
    list: Schema.Attribute.Component<'list.list', true>;
    title: Schema.Attribute.String;
  };
}

export interface InvoiceInvoice extends Struct.ComponentSchema {
  collectionName: 'components_invoice_invoices';
  info: {
    displayName: 'Invoice';
  };
  attributes: {
    file: Schema.Attribute.Media<'files'>;
  };
}

export interface JeeTrackJeeTrack extends Struct.ComponentSchema {
  collectionName: 'components_jee_track_jee_tracks';
  info: {
    displayName: 'JEE_track';
  };
  attributes: {
    JEE_track: Schema.Attribute.String;
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

export interface ListList extends Struct.ComponentSchema {
  collectionName: 'components_list_lists';
  info: {
    displayName: 'list';
  };
  attributes: {
    list: Schema.Attribute.Text;
    sub_list: Schema.Attribute.Text;
    title: Schema.Attribute.String;
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

export interface NeetTrackNeetTrack extends Struct.ComponentSchema {
  collectionName: 'components_neet_track_neet_tracks';
  info: {
    displayName: 'NEET_track';
  };
  attributes: {
    NEET_track: Schema.Attribute.String;
  };
}

export interface OfferPointsOfferPoints extends Struct.ComponentSchema {
  collectionName: 'components_offer_points_offer_points';
  info: {
    displayName: 'offer_points';
  };
  attributes: {
    offer_points: Schema.Attribute.Text;
  };
}

export interface OfflinePointsOfflinePoints extends Struct.ComponentSchema {
  collectionName: 'components_offline_points_offline_points';
  info: {
    displayName: 'offline_points';
  };
  attributes: {
    offline_points: Schema.Attribute.Text;
  };
}

export interface OnlinePointsOnlinePoints extends Struct.ComponentSchema {
  collectionName: 'components_online_points_online_points';
  info: {
    displayName: 'online_points';
  };
  attributes: {
    online_points: Schema.Attribute.Text;
  };
}

export interface OrderHistoryOrderHistory extends Struct.ComponentSchema {
  collectionName: 'components_order_history_order_histories';
  info: {
    displayName: 'Order-History';
  };
  attributes: {};
}

export interface PreparationCardsPreparationCards
  extends Struct.ComponentSchema {
  collectionName: 'components_preparation_cards_preparation_cards';
  info: {
    displayName: 'preparation_cards';
  };
  attributes: {
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface ProductItemProductItem extends Struct.ComponentSchema {
  collectionName: 'components_product_item_product_items';
  info: {
    displayName: 'Product_Item';
  };
  attributes: {
    Product_Id: Schema.Attribute.String;
    Product_Price: Schema.Attribute.String;
    Product_Title: Schema.Attribute.String;
    Quantity: Schema.Attribute.Integer;
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

export interface ShippingAddressShippingAddress extends Struct.ComponentSchema {
  collectionName: 'components_shipping_address_shipping_addresses';
  info: {
    displayName: 'Shipping_Address';
  };
  attributes: {
    Address: Schema.Attribute.String;
    City: Schema.Attribute.String;
    Email: Schema.Attribute.Email;
    Firstname: Schema.Attribute.String;
    Lastname: Schema.Attribute.String;
    Phone: Schema.Attribute.String;
    State: Schema.Attribute.String;
    Zipcode: Schema.Attribute.String;
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
    link: Schema.Attribute.String;
    points: Schema.Attribute.String;
  };
}

export interface StudyOfflineStudyOffline extends Struct.ComponentSchema {
  collectionName: 'components_study_offline_study_offlines';
  info: {
    displayName: 'study_offline';
  };
  attributes: {
    study_offline: Schema.Attribute.Text;
  };
}

export interface StudyOnlineStudyOnline extends Struct.ComponentSchema {
  collectionName: 'components_study_online_study_onlines';
  info: {
    displayName: 'study_online';
  };
  attributes: {
    study_online: Schema.Attribute.Text;
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

export interface TestimonialsTestimonials extends Struct.ComponentSchema {
  collectionName: 'components_testimonials_testimonials';
  info: {
    displayName: 'Testimonials';
  };
  attributes: {
    description: Schema.Attribute.Text;
    name: Schema.Attribute.String;
    role: Schema.Attribute.String;
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

export interface WishlistWishlist extends Struct.ComponentSchema {
  collectionName: 'components_wishlist_wishlists';
  info: {
    displayName: 'wishlist';
  };
  attributes: {
    products: Schema.Attribute.Relation<'oneToMany', 'api::product.product'>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'about-program.about-program': AboutProgramAboutProgram;
      'activity.activity-list': ActivityActivityList;
      'admission-steps.admission-steps': AdmissionStepsAdmissionSteps;
      'assessment.assessment': AssessmentAssessment;
      'billing-address.billing-address': BillingAddressBillingAddress;
      'cart-product.cart-product': CartProductCartProduct;
      'checklist.checklist': ChecklistChecklist;
      'coupons.coupons': CouponsCoupons;
      'course-content.course-content': CourseContentCourseContent;
      'course-item.course-item': CourseItemCourseItem;
      'course-list.course-list': CourseListCourseList;
      'course-testimonial-slider.course-testimonial-slider': CourseTestimonialSliderCourseTestimonialSlider;
      'course-video-slider.course-video-slider': CourseVideoSliderCourseVideoSlider;
      'course.course-overview': CourseCourseOverview;
      'courses.course-list': CoursesCourseList;
      'curriculam.curriculam': CurriculamCurriculam;
      'desc.data': DescData;
      'duration.duration-component': DurationDurationComponent;
      'families-points.families-points': FamiliesPointsFamiliesPoints;
      'faq.faq': FaqFaq;
      'feature-list.feature-list': FeatureListFeatureList;
      'feature.feature': FeatureFeature;
      'featured-list.featured-list': FeaturedListFeaturedList;
      'features.features': FeaturesFeatures;
      'highlight.highlight': HighlightHighlight;
      'integral-education.integral-education': IntegralEducationIntegralEducation;
      'integral-education.school-integral-education': IntegralEducationSchoolIntegralEducation;
      'integrated-programs.integrated-programs': IntegratedProgramsIntegratedPrograms;
      'invoice.invoice': InvoiceInvoice;
      'jee-track.jee-track': JeeTrackJeeTrack;
      'list.activity-list': ListActivityList;
      'list.list': ListList;
      'members.team': MembersTeam;
      'neet-track.neet-track': NeetTrackNeetTrack;
      'offer-points.offer-points': OfferPointsOfferPoints;
      'offline-points.offline-points': OfflinePointsOfflinePoints;
      'online-points.online-points': OnlinePointsOnlinePoints;
      'order-history.order-history': OrderHistoryOrderHistory;
      'preparation-cards.preparation-cards': PreparationCardsPreparationCards;
      'product-item.product-item': ProductItemProductItem;
      'quote.quote': QuoteQuote;
      'resourse.resource': ResourseResource;
      'sample.sampledata': SampleSampledata;
      'sciencequote.quote': SciencequoteQuote;
      'sessions.teaching-sessions': SessionsTeachingSessions;
      'sessions.teaching-sessionss': SessionsTeachingSessionss;
      'shipping-address.shipping-address': ShippingAddressShippingAddress;
      'skill-development.skill-development': SkillDevelopmentSkillDevelopment;
      'skill-list.skill-list': SkillListSkillList;
      'study-offline.study-offline': StudyOfflineStudyOffline;
      'study-online.study-online': StudyOnlineStudyOnline;
      'study.study-materials': StudyStudyMaterials;
      'subtitle.sub-title': SubtitleSubTitle;
      'subtitle.subtitle': SubtitleSubtitle;
      'support.support': SupportSupport;
      'teaching.teaching-methodology': TeachingTeachingMethodology;
      'test.test-assessment': TestTestAssessment;
      'testimonials.testimonials': TestimonialsTestimonials;
      'why-join.why-join': WhyJoinWhyJoin;
      'wishlist.wishlist': WishlistWishlist;
    }
  }
}
