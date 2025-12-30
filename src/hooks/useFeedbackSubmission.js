import { useState } from 'react';

import logger from '@/utils/logger';
import { sanitize } from '@/utils/security';

/**
 * Default implementation for submitting feedback to Firebase
 */
export const defaultSubmitFeedback = async (data) => {
  const { initializeFirebase } = await import('@/utils/firebase');
  const { db } = await initializeFirebase();
  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
  return addDoc(collection(db, 'feedback'), {
    ...data,
    timestamp: serverTimestamp(),
  });
};

/**
 * Feedback status states
 */
export const FEEDBACK_STATUS = {
  IDLE: 'idle',
  NOT_HELPFUL_FORM: 'not_helpful_form',
  SUBMITTING: 'submitting',
  SUBMITTED: 'submitted',
};

/**
 * Custom hook for managing feedback form state and submission
 * @param {Object} options - Configuration options
 * @param {Object} options.result - The solver result object
 * @param {string} options.input - The user's input sequence
 * @param {Function} options.getRecaptchaToken - Function to get reCAPTCHA token
 * @param {Function} options.submitFeedback - Optional custom submit function
 * @returns {Object} State and handlers for feedback form
 */
export function useFeedbackSubmission({
  result,
  input,
  getRecaptchaToken,
  submitFeedback = defaultSubmitFeedback,
}) {
  const [status, setStatus] = useState(FEEDBACK_STATUS.IDLE);
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');

  /**
   * Handle "Yes, this was helpful" action
   */
  const handleHelpful = async () => {
    setStatus(FEEDBACK_STATUS.SUBMITTING);
    try {
      const recaptchaToken = await getRecaptchaToken();
      await submitFeedback({
        isHelpful: true,
        question: sanitize(input),
        answer: result.predictions ? result.predictions.join(', ') : result.next,
        resultType: sanitize(result.type),
        resultRule: sanitize(result.rule),
        recaptchaToken,
      });
      setStatus(FEEDBACK_STATUS.SUBMITTED);
    } catch (error) {
      logger.error('Error adding document: ', error);
      setStatus(FEEDBACK_STATUS.SUBMITTED); // Optimistic UI
    }
  };

  /**
   * Handle "No, this was not helpful" action - shows the form
   */
  const handleNotHelpful = () => {
    setStatus(FEEDBACK_STATUS.NOT_HELPFUL_FORM);
  };

  /**
   * Handle submitting the "not helpful" form with reason and comment
   */
  const handleSubmitNotHelpful = async () => {
    if (!reason) return;
    setStatus(FEEDBACK_STATUS.SUBMITTING);
    try {
      const recaptchaToken = await getRecaptchaToken();
      await submitFeedback({
        isHelpful: false,
        reason,
        comment: sanitize(comment),
        question: sanitize(input),
        answer: result?.predictions ? result.predictions.join(', ') : result?.next,
        resultType: sanitize(result?.type || 'unknown'),
        resultRule: sanitize(result?.rule || 'unknown'),
        recaptchaToken,
      });
      setStatus(FEEDBACK_STATUS.SUBMITTED);
    } catch (error) {
      logger.error('Error adding document: ', error);
      setStatus(FEEDBACK_STATUS.SUBMITTED);
    }
  };

  /**
   * Reset form to idle state
   */
  const resetForm = () => {
    setStatus(FEEDBACK_STATUS.IDLE);
    setReason('');
    setComment('');
  };

  return {
    // State
    status,
    reason,
    comment,
    // Setters
    setReason,
    setComment,
    // Handlers
    handleHelpful,
    handleNotHelpful,
    handleSubmitNotHelpful,
    resetForm,
  };
}

export default useFeedbackSubmission;
