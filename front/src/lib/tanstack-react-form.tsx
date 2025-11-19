import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode, ReactElement } from 'react'

type ValidatorFn<TValues, TValue> = (value: TValue, values: TValues) => string | undefined

type Validators<TValues> = Partial<{
  [K in Extract<keyof TValues, string>]: ValidatorFn<TValues, TValues[K]>
}>

type CreateFormOptions<TValues> = {
  defaultValues: TValues
  validators?: Validators<TValues>
  onSubmit: SubmitHandler<TValues>
}

type FieldMeta = {
  isDirty: boolean
  isTouched: boolean
  touchedErrors: string[]
}

type FieldApi<TValue> = {
  name: string
  state: {
    value: TValue
    meta: FieldMeta
  }
  handleChange: (value: TValue) => void
  handleBlur: () => void
  setValue: (value: TValue) => void
}

type FieldProps<TValues, K extends Extract<keyof TValues, string>> = {
  name: K
  children: (fieldApi: FieldApi<TValues[K]>) => React.ReactNode
}

type BaseFormApi<TValues> = {
  Field: <K extends Extract<keyof TValues, string>>(props: FieldProps<TValues, K>) => ReactElement | null
  handleSubmit: (event?: React.FormEvent<HTMLFormElement>) => Promise<void>
  reset: () => void
  setFieldValue: <K extends Extract<keyof TValues, string>>(name: K, value: TValues[K]) => void
  state: {
    values: TValues
    errors: Partial<Record<Extract<keyof TValues, string>, string[]>>
    touched: Partial<Record<Extract<keyof TValues, string>, boolean>>
    isDirty: boolean
    isSubmitting: boolean
    submitCount: number
  }
}

type SubscribeProps<TValues, TSelected> = {
  selector: (state: BaseFormApi<TValues>['state']) => TSelected
  children: (selected: TSelected) => ReactNode
}

type TanstackFormApi<TValues> = BaseFormApi<TValues> & {
  Subscribe: <TSelected>(props: SubscribeProps<TValues, TSelected>) => ReactElement | null
}

type SubmitHandler<TValues> = (payload: {
  value: TValues
  formApi: BaseFormApi<TValues>
}) => Promise<void> | void

const clone = <T,>(value: T): T => structuredClone(value)

function useInternalForm<TValues extends Record<string, any>>(options: CreateFormOptions<TValues>): BaseFormApi<TValues> {
  const { validators: userValidators, defaultValues, onSubmit } = options
  const validatorsRef = useRef<Validators<TValues>>(userValidators ?? {})
  const onSubmitRef = useRef<SubmitHandler<TValues>>(onSubmit)
  const initialValuesRef = useRef<TValues>(clone(defaultValues))
  const [values, setValues] = useState<TValues>(() => clone(initialValuesRef.current))
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const touchedRef = useRef<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitCount, setSubmitCount] = useState(0)
  const formApiRef = useRef<BaseFormApi<TValues> | null>(null)

  useEffect(() => {
    validatorsRef.current = userValidators ?? {}
  }, [userValidators])

  useEffect(() => {
    onSubmitRef.current = onSubmit
  }, [onSubmit])

  const markTouched = useCallback((updater: (prev: Record<string, boolean>) => Record<string, boolean>) => {
    setTouched((prev) => {
      const next = updater(prev)
      touchedRef.current = next
      return next
    })
  }, [])

  const runValidator = useCallback(
    (name: Extract<keyof TValues, string>, value: TValues[typeof name], nextValues?: TValues) => {
      const validator = validatorsRef.current?.[name] as ValidatorFn<TValues, TValues[typeof name]> | undefined
      if (!validator) {
        return []
      }
      const message = validator(value, nextValues ?? values)
      return message ? [message] : []
    },
    [values],
  )

  const reset = useCallback(() => {
    const nextValues = clone(initialValuesRef.current)
    setValues(nextValues)
    setErrors({})
    markTouched(() => ({}))
    setSubmitCount(0)
  }, [markTouched])

  const setFieldValue = useCallback(
    (name: Extract<keyof TValues, string>, value: TValues[typeof name]) => {
      setValues((prev) => ({ ...prev, [name]: value }))
    },
    [],
  )

  const handleSubmit = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault()
      const currentValues = values
      const nextErrors: Record<string, string[]> = {}
      let hasErrors = false
      for (const key of Object.keys(currentValues) as Array<Extract<keyof TValues, string>>) {
        const result = runValidator(key, currentValues[key], currentValues)
        if (result.length) {
          hasErrors = true
          nextErrors[key] = result
        }
      }
      setErrors(nextErrors)
      markTouched((prev) => {
        const allTouched = { ...prev }
        for (const key of Object.keys(currentValues)) {
          allTouched[key] = true
        }
        return allTouched
      })
      setSubmitCount((count) => count + 1)
      if (hasErrors) {
        return
      }
      setIsSubmitting(true)
      try {
        await onSubmitRef.current?.({
          value: currentValues,
          formApi: formApiRef.current!,
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [markTouched, runValidator, values],
  )

  const Field = <K extends Extract<keyof TValues, string>>({
    name,
    children,
  }: FieldProps<TValues, K>) => {
    const value = values[name]
    const isTouched = touchedRef.current[name] ?? false
    const fieldErrors = errors[name] ?? []

    const handleBlur = () => {
      markTouched((prev) => ({ ...prev, [name]: true }))
      setErrors((prev) => ({
        ...prev,
        [name]: runValidator(name, values[name], values),
      }))
    }

    const handleChange = (nextValue: TValues[K]) => {
      setValues((prev) => {
        const nextValues = { ...prev, [name]: nextValue }
        if (touchedRef.current[name]) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: runValidator(name, nextValue, nextValues),
          }))
        }
        return nextValues
      })
    }

    return (
      <>
        {children({
          name,
          state: {
            value,
            meta: {
              isDirty: !Object.is(value, initialValuesRef.current[name]),
              isTouched,
              touchedErrors: isTouched ? fieldErrors : [],
            },
          },
          handleBlur,
          handleChange,
          setValue: (nextValue) => {
            setValues((prev) => ({ ...prev, [name]: nextValue }))
          },
        })}
      </>
    )
  }

  const isDirty = useMemo(() => {
    const keys = Object.keys(initialValuesRef.current) as Array<Extract<keyof TValues, string>>
    return keys.some((key) => !Object.is(values[key], initialValuesRef.current[key]))
  }, [values])

  const formApi: BaseFormApi<TValues> = {
    Field,
    handleSubmit,
    reset,
    setFieldValue,
    state: {
      values,
      errors,
      touched,
      isDirty,
      isSubmitting,
      submitCount,
    },
  }

  formApiRef.current = formApi

  return formApi
}

export function createForm<TValues extends Record<string, any>>(
  options: CreateFormOptions<TValues>,
): TanstackFormApi<TValues> {
  const formApi = useInternalForm(options)
  const latestFormApiRef = useRef(formApi)
  latestFormApiRef.current = formApi

  const subscribeImpl = <TSelected,>({
    selector,
    children,
  }: SubscribeProps<TValues, TSelected>): ReactElement | null => {
    const selected = selector(latestFormApiRef.current.state)
    return <>{children(selected)}</>
  }

  const fieldWrapperRef = useRef<TanstackFormApi<TValues>['Field'] | null>(null)
  const subscribeWrapperRef = useRef<TanstackFormApi<TValues>['Subscribe'] | null>(null)

  if (!fieldWrapperRef.current) {
    fieldWrapperRef.current = ((props) =>
      latestFormApiRef.current.Field(props)) as TanstackFormApi<TValues>['Field']
  }

  if (!subscribeWrapperRef.current) {
    subscribeWrapperRef.current = subscribeImpl
  }

  const stableFormRef = useRef<TanstackFormApi<TValues> | null>(null)
  if (!stableFormRef.current) {
    stableFormRef.current = {
      ...formApi,
      Field: fieldWrapperRef.current!,
      Subscribe: subscribeWrapperRef.current!,
    }
  } else {
    Object.assign(stableFormRef.current, formApi)
    stableFormRef.current.Field = fieldWrapperRef.current!
    stableFormRef.current.Subscribe = subscribeWrapperRef.current!
  }

  return stableFormRef.current
}

export type { TanstackFormApi as FormApi }
