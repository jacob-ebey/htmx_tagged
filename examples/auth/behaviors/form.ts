import type { BaseSchema, BaseSchemaAsync, Output } from "npm:valibot@0.8.0"
import {
  optional,
  parseAsync,
  string,
  transform,
  ValiError,
} from "npm:valibot@0.8.0"

const dev = Deno.args[0] === "dev"

export function safeRedirect(to?: string | null) {
  if (to && to.startsWith("/") && !to.startsWith("//")) {
    return to
  }
  return "/dashboard"
}

export function checkbox() {
  return transform(optional(string()), (value) => value === "on")
}

export function success<T>(result: T | null = null) {
  return {
    type: "success" as const,
    result,
    errors: null,
  }
}

export class FormError extends Error {
  constructor(message: string, public status = 400) {
    super(message)
  }
}

export function error(e: unknown, status: (code: number) => void) {
  const errors: Record<string, string[]> = {}

  if (e instanceof Response) {
    throw e
  }

  status(400)

  if (e instanceof ValiError) {
    for (const issue of e.issues) {
      let path = "_global"
      if (issue.path?.length) {
        path = issue.path.map((i) => i.key).join(".")
      }
      errors[path] = errors[path] ?? []
      errors[path].push(issue.message)
    }
  } else if (e instanceof FormError) {
    status(e.status)
    errors._global = [e.message]
  } else if (e instanceof Error) {
    if (dev) {
      errors._global = [e.message]
    } else {
      errors._global = ["An unknown error occurred."]
    }
  } else if (typeof e === "string") {
    errors._global = [e]
  } else {
    errors._global = ["An unknown error occurred."]
  }

  return {
    type: "error" as const,
    result: null,
    errors,
  }
}

export async function run<
  TSchema extends BaseSchema | BaseSchemaAsync,
  TResult,
>(
  schema: TSchema,
  request: Request,
  status: (code: number) => void,
  action: (safe: Output<TSchema>) => TResult | Promise<TResult>,
  callback: (result: TResult) => TResult | Promise<TResult> = action,
) {
  try {
    const formData = await request.formData()

    const data: Record<string, FormDataEntryValue | FormDataEntryValue[]> = {}
    for (const [key, value] of formData) {
      if (!(key in data)) {
        data[key] = value
      } else if (Array.isArray(data[key])) {
        const arr = data[key] as FormDataEntryValue[]
        arr.push(value)
      } else {
        data[key] = [data[key] as FormDataEntryValue, value]
      }
    }

    const safe = await parseAsync(schema, data)
    let result = await action(safe)
    if (callback) {
      result = await callback(result)
    }
    return success(result)
  } catch (e) {
    if (e instanceof Response) throw e
    return error(e, status)
  }
}
