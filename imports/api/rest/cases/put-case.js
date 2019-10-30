// @flow
import type { Request, Response } from '../rest-types'
import { caseEditableFields, fieldEditMethodMaker, publicationObj as casePubObj } from '../../cases'
import userApiKey, { makeComposedExtractor, bodyExtractor, headerExtractor } from '../middleware/user-api-key-middleware'

const caseEditor = fieldEditMethodMaker({
  methodName: 'PUT /api/case/:id',
  editableFields: caseEditableFields,
  publicationObj: casePubObj
})

export default userApiKey((req: Request, res: Response) => {
  const { user, params, body } = req
  const editObj = caseEditableFields.reduce((all, field) => {
    if (body[field]) {
      all[field] = body[field]
    }
    return all
  }, {})
  try {
    caseEditor(parseInt(params.id), editObj, user._id)
    res.send(200)
  } catch (e) {
    res.send(400, e.message)
  }
}, makeComposedExtractor(bodyExtractor, headerExtractor))
