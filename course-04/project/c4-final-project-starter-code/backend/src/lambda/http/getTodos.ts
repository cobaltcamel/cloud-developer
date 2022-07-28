import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult,} from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getAllTodos } from '../../businessLogic/todos'
import { getUserId } from '../utils';
//import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

// TODO: Get all TODO items for a current user

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    //TODO: Implement creating a new TODO item

  const userId = getUserId(event)
  const items = await getAllTodos(userId)

  return {
    statusCode: 200,
    body: JSON.stringify({
      items: items
    })
  }
}
)

handler.use(
  cors({
   credentials: true
  })
)


