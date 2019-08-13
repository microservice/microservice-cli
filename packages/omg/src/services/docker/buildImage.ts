interface BuildImageOptions {
  raw: boolean
  tagName: string | null
  configPath: string
}

export default async function buildImage(options: BuildImageOptions): Promise<void> {
  console.log('buildImage', options)
}
