// @flow
import { Meteor } from 'meteor/meteor'
import userApiKey, { bodyExtractor, headerExtractor, makeComposedExtractor } from './middleware/user-api-key-middleware'
import { check, Match } from 'meteor/check'
import { logger } from '../../util/logger'
import { createCase } from '../cases'
import { serverHelpers } from '../units'
import UnitMetaData from '../unit-meta-data'

import type { Request, Response } from './rest-types'
import { roleEnum } from '../unit-roles-data'

const allowedRoles = Object.values(roleEnum).filter(val => val !== roleEnum.CONTRACTOR)

const isDateString = str => typeof str === 'string' && !isNaN((new Date(str)).getTime())

export default userApiKey((req: Request, res: Response) => {
  const errorLog = 'API request for "POST /cases" failed: '

  //
  // Payload validation checks
  //
  try {
    check(req.body, Match.ObjectIncluding({
      title: String,
      details: Match.Maybe(String),
      assignedRole: Match.OneOf(...allowedRoles),
      category: Match.Maybe(String),
      subCategory: Match.Maybe(String),
      severity: Match.Maybe(String),
      priority: Match.Maybe(String),
      solution: Match.Maybe(String),
      solutionDeadline: Match.Maybe(Match.Where(isDateString)),
      nextSteps: Match.Maybe(String),
      nextStepsBy: Match.Maybe(Match.Where(isDateString))
    }))
    try {
      check(req.body, Match.OneOf(
        Match.ObjectIncluding({ unitId: String }),
        Match.ObjectIncluding({ unitAliasId: String })
      ))
    } catch (e) {
      throw new Meteor.Error('The request\'s body must contain either "unitId"(String) or "unitAliasId"(String)')
    }
    try {
      check(req.body, Match.OneOf(
        Match.ObjectIncluding({ assigneeId: Match.Maybe(String) }),
        Match.ObjectIncluding({ assigneeAliasId: Match.Maybe(String) })
      ))
    } catch (e) {
      throw new Meteor.Error('The request\'s body can contain either "assigneeId"(String) or "assigneeAliasId"(String)')
    }
    try {
      check(req.body, Match.OneOf(
        Match.ObjectIncluding({ reporterId: Match.Maybe(String) }),
        Match.ObjectIncluding({ reporterAliasId: Match.Maybe(String) })
      ))
    } catch (e) {
      throw new Meteor.Error('The request\'s body can contain  either "reporterId"(String) or "reporterAliasId"(String)')
    }
  } catch (e) {
    logger.warn(errorLog + e.message)
    res.send(400, e.message)
    return
  }

  //
  // Data fetching
  //

  const {
    unitId,
    unitAliasId,
    reporterId,
    reporterAliasId,
    title,
    details,
    category,
    subCategory,
    assignedRole,
    assigneeId,
    assigneeAliasId,
    severity,
    priority,
    solution,
    solutionDeadline,
    nextSteps,
    nextStepsBy
  } = req.body

  let reporter
  if (!reporterId && !reporterAliasId) {
    reporter = req.user
  } else {
    reporter = reporterId
      ? Meteor.users.findOne({ _id: reporterId })
      : Meteor.users.findOne({
        apiAliases: {
          userId: req.user._id,
          id: reporterAliasId
        }
      })

    if (!reporter) {
      const message = 'No user found as reporter for ' + (reporterId ? `reporterId ${reporterId}` : `reporterAliasId ${reporterAliasId}`)
      logger.warn(errorLog + message)
      res.send(400, message)
      return
    } else if (reporter.profile.creatorId !== req.user._id && reporter._id !== req.user._id) {
      const message = 'The provided apiKey doesn\'t belong to a user who is allowed to set the specified user as reporter'
      logger.warn(errorLog + message)
      res.send(403, message)
      return
    }
  }

  const unitMeta = unitId
    ? UnitMetaData.findOne({ _id: unitId })
    : UnitMetaData.findOne({
      apiAliases: {
        userId: req.user._id,
        id: unitAliasId
      }
    })
  if (!unitMeta) {
    const message = 'No unit found for ' + (unitId ? `unitId ${unitId}` : `unitAliasId ${unitAliasId}`)
    logger.warn(errorLog + message)
    res.send(400, message)
    return
  }

  let unitItem
  try {
    unitItem = serverHelpers.getAPIUnitByName(unitMeta.bzName, reporter.bugzillaCreds.apiKey)
  } catch (e) {
    logger.warn(errorLog + e.message)
    res.send(400, e.message)
    return
  }
  if (!unitItem) {
    const message = 'The user specified as reporter does not have visibility of the specified unit'
    logger.warn(errorLog + message)
    res.send(400, message)
    return
  }

  let assignee
  if (assigneeId || assigneeAliasId) {
    const assigneeUser = assigneeId
      ? Meteor.users.findOne({ _id: assigneeId })
      : Meteor.users.findOne({
        apiAliases: {
          userId: req.user._id,
          id: assigneeAliasId
        }
      })
    if (!assigneeUser) {
      const message = 'No user found as assignee for ' + (assigneeId ? `assigneeId ${assigneeId}` : `assigneeAliasId ${assigneeAliasId}`)
      logger.warn(errorLog + message)
      res.send(400, message)
      return
    }
    assignee = assigneeUser.bugzillaCreds.login
  }

  let newCaseId
  try {
    newCaseId = createCase(
      reporter,
      unitItem,
      {
        title,
        details,
        category,
        subCategory,
        assignee,
        severity,
        priority,
        solution,
        solutionDeadline,
        nextSteps,
        nextStepsBy,
        assignedUnitRole: assignedRole
      }
    )
  } catch (e) {
    logger.warn(errorLog + e.message)
    res.send(500, e.message)
    return
  }

  res.send(200, { id: newCaseId })
}, makeComposedExtractor(bodyExtractor, headerExtractor))
