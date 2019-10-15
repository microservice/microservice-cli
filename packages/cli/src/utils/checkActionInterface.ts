/**
 * Checks if any action in he given microserviceJson does not have
 * and interface (http, format, rpc, xor events).
 *
 * @param {Object} microserviceJson The given microservice json
 * @throws {Object} Throws error if more, or less than one interface
 *                  is given for an action
 */
export default function checkActionInterface(microserviceJson: any): void {
  if (microserviceJson.actions) {
    const actionMap = microserviceJson.actions

    Object.keys(actionMap).forEach(actionName => {
      const action = actionMap[actionName]
      const bools = [!!action.http, !!action.format, !!action.rpc, !!action.events].filter(b => b)
      if (bools.length !== 1) {
        throw {
          text: `actions.${actionName} should have one of required property: 'http' 'format' 'rpc' or 'events'`,
        }
      }
    })
  }
}
