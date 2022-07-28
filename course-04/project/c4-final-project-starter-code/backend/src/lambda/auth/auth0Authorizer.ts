import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJHZjmkoKcM3GeMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi00cjRqYWlxdC51cy5hdXRoMC5jb20wHhcNMjIwNzI1MDc0ODQ2WhcN
MzYwNDAyMDc0ODQ2WjAkMSIwIAYDVQQDExlkZXYtNHI0amFpcXQudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqP/0PL9D/AHIVk9W
LksuI8UKmue2P8GebXeb5Xfvn/QC1eQqyk/eN/aXxtKv6zK84id+fpavLGeudOJQ
wNKP7fzGOgoWgpkfBy0mt6sIIQBteprQpIUc/mBZqD5sHR24WnYDV7FxqYeE7WZK
0ggsJIY11R0UGdV0GtawZ3U5uqLHrL20toO8nrJg3/JzUjSM8Uqf+IrDmVCIVX4W
SgHOpvWvxHVSaG8QfYCodLevMp/TqNHLKm5pts4+4jqBOzNrqOD9ds6nzuzk12wK
l/he6E+743WKrwCv/PDX6K9ymIK144KeIGh3I9IOfi0wTfXt9/8XGfZeEQOOgBKX
xUNYfwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBRtf3WkvtrV
H1sc65Cywpt83u6SMzAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
ACXaQ3bxNuuw5Pe/kLIYBamrX+7fXm1AcnGBrEy3R5kNmOsXOZSRUTPBnGMuGpcI
M5p99jl8E8uN46CwoWH7o0CVCCiZEn2ptn4ABzJutEHndhMz9CtmTRB0yPevrHq4
Yjmj0Uv3VO79dKQeePFovWk81RIdJenOaujfgBvV1iSZ0Yp/s2PID8vjeEKNec2b
Hydu78q82dIenTHWPW8nKRPqsSwXBZsAbVCGM1YojE74zIZwHEG2EW+9W98dmJbM
5oc0QUWHf07ULKP9RLbUbmrA6cBxqCHximU3ML4gQwbR28+ajNE8WMQpUsVOmusL
09BtrS+RdcfunxlqF8SMk2A=
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
