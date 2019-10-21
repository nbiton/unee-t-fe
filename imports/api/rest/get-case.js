// @flow
import type { Request, Response } from './rest-types'
import userApiKey, {
  headerExtractor,
  makeComposedExtractor,
  queryExtractor
} from './middleware/user-api-key-middleware'
import { idUrlTemplate, transformCaseForClient } from '../cases'
import { factoryOptions as commentFactoryOptions } from '../comments'
import { callAPI } from '../../util/bugzilla-api'
import { logger } from '../../util/logger'
import { caseAPIFields } from './get-cases'

export default userApiKey((req: Request, res: Response) => {
  const { user, params } = req
  const { apiKey } = user.bugzillaCreds

  // Getting the case's data
  let caseItem
  try {
    const caseResp = callAPI('get', idUrlTemplate(params.id), { api_key: apiKey }, false, true)
    const bugItem = caseResp.data.bugs[0]
    if (!bugItem) {
      res.send(404, `No accessible case with id ${params.id} was found for this user`)
      return
    }

    caseItem = transformCaseForClient(caseAPIFields.reduce((item, field) => {
      item[field] = bugItem[field]
      return item
    }, {}))
  } catch (e) {
    logger.error(`Failed to fetch case ${params.id} from BZ API for user ${user._id} reason: ${e.message}`)
    res.send(500, e.message)
    return
  }

  // Getting the comments' data
  let commentList
  try {
    const commentsResp = callAPI('get', `/rest/bug/${params.id}/comment`, { api_key: apiKey }, false, true)
    commentList = commentFactoryOptions.dataResolver(commentsResp.data, params.id)
  } catch (e) {
    logger.error(`Failed to fetch comments for case ${params.id} from BZ API for user ${user._id} reason: ${e.message}`)
    res.send(500, e.message)
    return
  }

  res.send(200, {
    ...caseItem,
    comments: commentList
  })
}, makeComposedExtractor(queryExtractor, headerExtractor))
