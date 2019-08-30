import { combineReducers } from 'redux'
import { routerReducer as router } from 'react-router-redux'
import showLoginError from './reducers/show-login-error'
import userCreationState from './reducers/user-creation-state'
import attachmentUploads from './reducers/attachment-uploads'
import invitationState from './reducers/invitation-state'
import caseCreationState from './reducers/case-creation-state'
import reportCreationState from './reducers/report-creation-state'
import invitationLoginState from './reducers/invitation-login-state'
import sendResetLinkState from './reducers/send-reset-link-state'
import caseSearchState from './reducers/case-search-state'
import resendVerificationState from './reducers/resend-verification-state'
import passResetState from './reducers/pass-reset-state'
import caseUsersState from './reducers/case-users-state'
import drawerState from './reducers/drawer-state'
import unitCreationState from './reducers/unit-creation-state'
import genericErrorState from './reducers/generic-error-state'
import reportPreviewUrls from './reducers/report-preview-urls'
import reportSharingState from './reducers/report-sharing-state'
import unitInvitationState from './reducers/unit-invitation-state'
import logoChangingState from './reducers/logo-changing-state'
import avatarChangingState from './reducers/avatar-changing-state'
import unitUserRemovalState from './reducers/unit-user-removal-state'
import unitFloorPlanUploadState from './reducers/unit-floor-plan-upload-state'

const rootReducer = combineReducers({
  showLoginError,
  userCreationState,
  attachmentUploads,
  invitationState,
  caseCreationState,
  invitationLoginState,
  sendResetLinkState,
  caseSearchState,
  resendVerificationState,
  passResetState,
  caseUsersState,
  drawerState,
  unitCreationState,
  reportCreationState,
  genericErrorState,
  reportPreviewUrls,
  reportSharingState,
  unitInvitationState,
  logoChangingState,
  avatarChangingState,
  unitUserRemovalState,
  unitFloorPlanUploadState,
  router
})

export default rootReducer
