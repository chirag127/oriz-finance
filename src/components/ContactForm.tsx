/*
 * ContactForm — local, dependency-free copy that emits the canonical
 * `data-oriz-contact-*` selector hooks. Posts to Web3Forms.
 *
 * The shared @chirag127/contact-form package uses react-hook-form + zod;
 * this site keeps deps minimal so we use plain React state + a tiny
 * validator. The hook contract (the data attributes) is identical so the
 * shared CSS in oriz-ui-overrides.css applies unchanged.
 */
import { type FormEvent, useEffect, useRef, useState } from 'react'

interface Props {
  web3formsKey: string
  fromName?: string
}

type Status = 'idle' | 'submitting' | 'success' | 'error'
const SUCCESS_HIDE_MS = 5000

interface Errors {
  name?: string
  email?: string
  subject?: string
  message?: string
}

export default function ContactForm({ web3formsKey, fromName = 'contact form' }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [showSuccess, setShowSuccess] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
      if (successTimerRef.current !== null) clearTimeout(successTimerRef.current)
    }
  }, [])

  const validate = (): Errors => {
    const e: Errors = {}
    if (!name.trim()) e.name = 'Required'
    if (!email.trim()) e.email = 'Required'
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) e.email = 'Enter a valid email'
    if (!subject.trim()) e.subject = 'Required'
    if (message.trim().length < 10) e.message = 'At least 10 characters'
    return e
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const honeypot = (
      e.currentTarget.querySelector('input[name="botcheck"]') as HTMLInputElement | null
    )?.value
    if (honeypot) return

    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setStatus('submitting')

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: web3formsKey,
          from_name: fromName,
          name,
          email,
          subject,
          message,
        }),
        signal: controller.signal,
      })
      if (!res.ok) throw new Error(`Web3Forms returned HTTP ${res.status}`)
      setStatus('success')
      setShowSuccess(true)
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
      if (successTimerRef.current !== null) clearTimeout(successTimerRef.current)
      successTimerRef.current = setTimeout(() => setShowSuccess(false), SUCCESS_HIDE_MS)
    } catch (err) {
      if (controller.signal.aborted) return
      setStatus('error')
      const msg = err instanceof Error ? err.message : String(err)
      setErrors({ message: msg })
    }
  }

  const isSubmitting = status === 'submitting'

  return (
    <form data-oriz-contact data-oriz-contact-status={status} onSubmit={onSubmit} noValidate>
      <input
        type="text"
        name="botcheck"
        data-oriz-contact-honeypot
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px' }}
      />
      <label data-oriz-contact-field="name">
        <span>Your name</span>
        <input
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && <p data-oriz-contact-error>{errors.name}</p>}
      </label>
      <label data-oriz-contact-field="email">
        <span>Email</span>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && <p data-oriz-contact-error>{errors.email}</p>}
      </label>
      <label data-oriz-contact-field="subject">
        <span>Subject</span>
        <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
        {errors.subject && <p data-oriz-contact-error>{errors.subject}</p>}
      </label>
      <label data-oriz-contact-field="message">
        <span>Message</span>
        <textarea rows={6} value={message} onChange={(e) => setMessage(e.target.value)} />
        {errors.message && <p data-oriz-contact-error>{errors.message}</p>}
      </label>
      <button type="submit" data-oriz-contact-submit disabled={isSubmitting}>
        {isSubmitting ? 'Sending…' : 'Send'}
      </button>
      {showSuccess && (
        <p data-oriz-contact-success role="status">
          Sent. Thanks.
        </p>
      )}
    </form>
  )
}
