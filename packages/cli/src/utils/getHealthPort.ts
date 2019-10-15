import { Microservice } from '@microservices/validate'

/**
 * Return the health port
 *
 * @param  {Microservice} microservice Provided microservice as a JSON
 * @return {number} port number
 */
export default function getHealthPort(microservice: Microservice): number {
  return microservice.health.port
}
