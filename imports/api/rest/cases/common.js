// @flow
import { Meteor } from 'meteor/meteor'
import UnitRolesData from '../../unit-roles-data'
import { transformCaseForClient } from '../../cases'

type UserDoc = {
  _id: string,
  profile: {
    name?: string
  },
  emails: Array<{
    address: string
  }>
}

type UserTransformer = (user: UserDoc) => {
  userId?: string,
  name?: string,
  role?: ?string
}
export const caseAPIFields = [
  'product',
  'summary',
  'id',
  'assigned_to',
  'creation_time',
  'cf_ipi_clust_1_next_step',
  'cf_ipi_clust_1_next_step_by',
  'description',
  'cf_ipi_clust_1_solution',
  'deadline',
  'cc',
  'platform',
  'cf_ipi_clust_6_claim_type',
  'creator'
]

export const makeUserAPIObjGenerator = (unitMongoId: string) => {
  const unitRolesDict = UnitRolesData.find({
    unitId: unitMongoId
  }, {
    fields: {
      'members.id': 1,
      roleType: 1
    }
  }).fetch().reduce((all, role) => {
    role.members.forEach(member => {
      all[member.id] = role.roleType
    })
    return all
  }, {})

  return (userDoc: UserDoc) => {
    const userObj = {}
    if (userDoc) {
      userObj.userId = userDoc._id
      userObj.name = userDoc.profile.name || userDoc.emails[0].address.split('@')[0]
      userObj.role = unitRolesDict[userDoc._id] || null
    }
    return userObj
  }
}

export const tranformCaseAPIObj = (bug: any, thisUser: { _id: string }, transformUserObj: UserTransformer) => {
  const {
    product,
    id,
    assigned_to: assignedTo,
    assigned_to_detail: a,
    cc,
    cc_detail: b,
    creator,
    creator_detail: c,
    creation_time: creationTime,
    ...relevantBugFields
  } = bug
  const userRelevance = []
  const assigneeObj = transformUserObj(Meteor.users.findOne({ 'bugzillaCreds.login': assignedTo }))
  if (thisUser._id === assigneeObj.userId) {
    userRelevance.push('Assignee')
  }

  const reporterObj = transformUserObj(Meteor.users.findOne({ 'bugzillaCreds.login': creator }))
  if (thisUser._id === reporterObj.userId) {
    userRelevance.push('Reporter')
  }

  const involvedList = cc.map(ccItem => transformUserObj(Meteor.users.findOne({ 'bugzillaCreds.login': ccItem })))
  if (involvedList.some(involved => involved.userId === thisUser._id)) {
    userRelevance.push('Invited To')
  }
  return {
    assignee: assigneeObj,
    reporter: reporterObj,
    caseId: id,
    involvedList,
    userRelevance,
    creationTime,
    ...transformCaseForClient(relevantBugFields)
  }
}
