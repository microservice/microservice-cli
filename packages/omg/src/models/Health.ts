const validateHealth = require('../schema/schema').health

/**
 * Defines health object from microservice.yml
 * This object is complient with the Docker API.
 * See https://docs.docker.com/engine/api/v1.37/#operation/ContainerCreate
 */
export default class Health {
  private readonly _interval: number
  private readonly _timeout: number
  private readonly _startPeriod: number
  private readonly _retries: number
  private readonly _cmd: Array<string>

  /**
   * @param  {any} rawHealth Health json object from microservice.yml
   */
  constructor(rawHealth: any) {
    const isValid = validateHealth(rawHealth)

    if (!isValid.valid) {
      isValid.text = isValid.text.replace(/data/g, 'health')
      throw isValid
    }

    this._interval = Health.getNanoSecondsValue(rawHealth.interval || null)
    this._timeout = Health.getNanoSecondsValue(rawHealth.timeout || null)
    this._startPeriod = Health.getNanoSecondsValue(
      rawHealth.start_period || null
    )
    this._retries = rawHealth.retries || 0
    this._cmd = ['CMD-SHELL', rawHealth.command]
  }

  /**
   * Converts number as string or number to number in nanoseconds
   *
   * @param  {string} initial Initial number as a string, using units such as 's', 'ms'
   * @return {number} The interger in nanoseconds
   */
  private static getNanoSecondsValue(initial: string): number {
    if (typeof initial === 'number' && parseInt(initial, 10)) {
      return initial
    }
    if (!initial) {
      return 0
    }
    const int = parseInt(initial.match(/(\d)+/)[0], 10)
    const unit = initial.match(/ms|s/)[0]
    if (int === 0) {
      return 0
    }
    switch (unit) {
      case 'ms':
        return int * 1000000
      case 's':
        return int * 1000000000
    }
    return 0
  }

  /**
   * Getter for health interval
   *
   * @return {number} interval
   */
  public get interval(): number {
    return this._interval
  }

  /**
   * Getter for health timeout
   *
   * @return {number} timeout
   */
  public get timeout(): number {
    return this._timeout
  }

  /**
   * Getter for health startPeriod
   *
   * @return {number} startPeriod
   */
  public get startPeriod(): number {
    return this._startPeriod
  }

  /**
   * Getter for health retries
   *
   * @return {number} retries
   */
  public get retries(): number {
    return this._retries
  }

  /**
   * Getter for health command
   *
   * @return {Array} Command in an Array<string>
   */
  public get command(): Array<string> {
    return this._cmd
  }
}
