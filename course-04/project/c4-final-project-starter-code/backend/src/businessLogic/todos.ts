import { TodoAccess } from './../dataLayer/todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as uuid from 'uuid'
import { FileStorage } from '../fileStorage/attachmentUtils';
//import { getUserId } from '../lambda/utils';

// TODO: Implement businessLogic

const todo = new TodoAccess()
const todoFile = new FileStorage()
const bucketName = process.env.ATTACHMENT_S3_BUCKET

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
  return await todo.getAllTodos(userId)
}

export async function createTodo(
  userId: string,
  payload: CreateTodoRequest
): Promise<TodoItem> {
  const todoId = uuid.v4()
  const data = {
    todoId,
    userId,
    name: payload.name,
    dueDate: payload.dueDate,
    done: false,
    createdAt: new Date().toISOString()
    
  }

  return await todo.createTodo(data)
}


export async function updateTodo(todoId: string, userId: string, payload: UpdateTodoRequest): Promise<void> {
    const data = {
        todoId,
        userId,
        name: payload.name,
        dueDate: payload.dueDate,
        done: payload.done,
        createdAt: new Date().toISOString()
        
      }

  return await todo.updateTodo(data)
}

export async function deleteTodo(todoId: string, userId: string): Promise<void> {
  await todo.deleteTodo(todoId, userId)
}


export async function getUploadUrl(todoId: string, userId:string) {
  const signedUrl =await todoFile.generateUploadUrl(todoId)

  if (signedUrl) {
    await addAttachmentUrl(bucketName, todoId, userId)
    return signedUrl
  }
}

async function addAttachmentUrl(bucketName, todoId, userId) {
  const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`

  await todo.updateTodoAttachment(todoId, userId, attachmentUrl)
}
