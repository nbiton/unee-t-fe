// @flow
import { Meteor } from 'meteor/meteor'
import userApiKey, { bodyExtractor } from './middleware/user-api-key-middleware'
import { check, Match } from 'meteor/check'
import { logger } from '../../util/logger'
import { createCase } from '../cases'
import { serverHelpers } from '../units'
import UnitMetaData from '../unit-meta-data'

import type { Request, Response } from './rest-types'

export default userApiKey((req: Request, res: Response) => {
  const errorLog = 'API request for "POST /cases" failed: '
  try {
    check(req.body, Match.ObjectIncluding({
      unitId: String,
      title: String,
      details: Match.Maybe(String),
      assignedRole: String,
      category: Match.Maybe(String),
      subCategory: Match.Maybe(String),
      assigneeId: Match.Maybe(String)
    }))
  } catch (e) {
    logger.warn(errorLog + e.message)
    res.send(400, e.message)
    return
  }

  const { unitId, title, details, category, subCategory, assignedRole, assigneeId } = req.body
  const unitMeta = UnitMetaData.findOne({ _id: unitId })
  if (!unitMeta) {
    const message = `No unit found for _id ${unitId}`
    logger.warn(errorLog + message)
    res.send(400, message)
    return
  }

  let unitItem
  try {
    unitItem = serverHelpers.getAPIUnitByName(unitMeta.bzName, req.user.bugzillaCreds.apiKey)
  } catch (e) {
    logger.warn(errorLog + e.message)
    res.send(400, e.message)
    return
  }
  let assignee
  if (assigneeId) {
    const assigneeUser = Meteor.users.findOne({ _id: assigneeId })
    if (!assigneeUser) {
      const message = `No user found for assigneeId of ${assigneeId}`
      logger.warn(errorLog  + message)
      res.send(400, message)
      return
    }
    assignee = assigneeUser.bugzillaCreds.login
  }

  let newCaseId
  try {
    newCaseId = createCase(
      req.user,
      unitItem,
      {
        title,
        details,
        category,
        subCategory,
        assignee,
        assignedUnitRole: assignedRole
      }
    )
  } catch (e) {
    logger.warn(errorLog + e.message)
    res.send(500, e.message)
    return
  }

  res.send(200, { id: newCaseId })
}, bodyExtractor)
