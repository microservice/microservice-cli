import store from '~/store'

async function apiRequest(endpoint: string, payload: Record<string, any>) {
  const response = await fetch(`/api/${endpoint}`, {
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response.json()
}

export async function buildImage() {
  const { envValues: envs } = store.state.config
  await apiRequest('buildImage', { envs })
}
