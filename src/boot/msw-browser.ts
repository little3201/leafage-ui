import {setupWorker} from 'msw/browser'
import { handlers } from "src/mocks"

export const worker = setupWorker(...handlers)