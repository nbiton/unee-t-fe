// @flow
import {
  INVITE_STARTED,
  INVITE_SUCCESS,
  INVITE_ERROR,
  INVITE_CLEARED
} from '../actions/unit-invite.actions'

import ProcessRepositoryReducer from './base/process-repository-reducer'

export default ProcessRepositoryReducer({
  startAction: INVITE_STARTED,
  successAction: INVITE_SUCCESS,
  errorAction: INVITE_ERROR,
  clearAction: INVITE_CLEARED,
  fieldNames: ['userEmail', 'unitBzId']
})
