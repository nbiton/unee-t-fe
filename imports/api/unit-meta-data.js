import { Mongo } from 'meteor/mongo'
import { Meteor } from 'meteor/meteor'

export const collectionName = 'unitMetaData'
export const unitTypes = Object.freeze([
  {
    name: 'Apartment/Flat'
  },
  {
    name: 'House'
  },
  {
    name: 'Room'
  },
  {
    name: 'Villa'
  },
  {
    name: 'Office'
  },
  {
    name: 'Hotel'
  },
  {
    name: 'Hotel Room'
  },
  {
    name: 'Shop'
  },
  {
    name: 'Salon'
  },
  {
    name: 'Restaurant/Cafe'
  },
  {
    name: 'Condominium'
  },
  {
    name: 'Apartment Block'
  },
  {
    name: 'Warehouse'
  },
  {
    name: 'Shopping Mall'
  },
  {
    name: 'Other'
  },
  {
    name: 'Unknown'
  }
])

// TODO: Figure this out later
// export const formatAddressLabel = metaData => {
//   let fullLabel = ''
//   if (metaData.streetAddress) fullLabel += metaData.streetAddress + ', '
//   if (metaData.city && metaData.zipCode) {
//     fullLabel += `${metaData.city} ${metaData.zipCode}, `
//   } else if (metaData.city) {
//     fullLabel += metaData.city + ', '
//   } else if (metaData.zipCode) {
//     fullLabel += metaData.zipCode + ', '
//   }
//   // if (metaData.state)
//
//      // ${metaData.zipCode}`
// }

const UnitMetaData = new Mongo.Collection(collectionName)

Meteor.methods({
  [`${collectionName}.update`] (id, unitFields) {
    const updatableFieldNames = [
      'unitType',
      'moreInfo',
      'displayName',
      'country',
      'streetAddress',
      'zipCode',
      'state',
      'city'
    ]

    const disallowedFieldName = Object.keys(unitFields).find(key => !updatableFieldNames.includes(key))
    if (disallowedFieldName) {
      throw new Meteor.Error(`Updating ${disallowedFieldName} is not allowed`)
    }

    if (unitFields.unitType && !unitTypes.map(t => t.name).includes(unitFields.unitType)) {
      throw new Meteor.Error(`Unrecognized unit type "${unitFields.unitType}"`)
    }

    const metaData = UnitMetaData.findOne({ _id: id })
    if (!metaData) {
      throw new Meteor.Error(`No unit found for id ${id}`)
    }
    if (!metaData.ownerIds.includes(Meteor.userId())) {
      throw new Meteor.Error('You are not one of the owners for this unit, so you are not allowed to update it')
    }

    UnitMetaData.update({ _id: id }, { $set: unitFields })
  }
})

export default UnitMetaData
