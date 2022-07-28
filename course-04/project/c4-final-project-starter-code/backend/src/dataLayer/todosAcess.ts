import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'


const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodoAccess {

    constructor(
      private readonly docClient: DocumentClient = createDynamoDBClient(),
      private readonly todosTable = process.env.TODOS_TABLE,
      private readonly indexName = process.env.TODOS_CREATED_AT_INDEX) {
    }
  
    async getAllTodos(userId: string): Promise<TodoItem[]> {
      logger.info('Getting all todo items')
  
      const result = await this.docClient
        .query({
          TableName: this.todosTable,
          IndexName: this.indexName,
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: {
            ':userId': userId
          },
          ScanIndexForward: false
        })
        .promise()
  
      const items = result.Items
  
      return items as TodoItem[]
    }
  
    async createTodo(todo: TodoItem): Promise<TodoItem> {
      logger.info("Creating a todo", todo)
  
      const newItem = {
        ...todo
      }
  
      await this.docClient
        .put({
          TableName: this.todosTable,
          Item: newItem
        })
        .promise()
  
      return todo
    }
  
    async updateTodo(todo: TodoItem){
      logger.info ("Updating a todo", todo)
  
    
  
      await this.docClient
        .update({
          TableName: this.todosTable,
          Key: {
            userId: todo.userId,
            todoId: todo.todoId
          },
          ExpressionAttributeNames: {
            '#tName': 'name'
          },
          UpdateExpression: 'set #tName = :name, dueDate = :dueDate, done = :done',
          ExpressionAttributeValues: {
            ':name': todo.name,
            ':dueDate': todo.dueDate,
            ':done': todo.done
          }
        })
        .promise()
  
    }

    async updateTodoAttachment(todoId: string,userId: string, url: string){
      logger.info ("updateTodoAttachment a todo", url)
  
    
  
      await this.docClient
        .update({
          TableName: this.todosTable,
          Key: {
            userId: userId,
            todoId: todoId
          },
          UpdateExpression: 'set  attachmentUrl = :url',
          ExpressionAttributeValues: {
            ':url': url
          }
        })
        .promise()
  
    }
  
    async deleteTodo(todoId: string, userId: string) {
      logger.info("Deleting a todo",todoId)
  
      await this.docClient
        .delete({
          TableName: this.todosTable,
          Key: {
            userId,
            todoId
          },
          ConditionExpression: 'todoId = :todoId',
          ExpressionAttributeValues: {
            ':todoId': todoId
          }
        })
        .promise()
  
    
    }
    // removed generate URL
  }

  function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
      logger.info('Creating a local DynamoDB instance')
      return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }
  
    return new XAWS.DynamoDB.DocumentClient()
  }
  

    
  
  
