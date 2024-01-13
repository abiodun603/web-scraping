'use client'
import Image from 'next/image'

import { FormEvent, Fragment, useState } from 'react'

// ** Third Party
import { Dialog, Transition } from '@headlessui/react'

// ** libs
import { addUserEmailToProduct } from '@/lib/actions'

interface Props {
  productId: string
}

const Modal = ({ productId }: Props) => {
  let [isOpen, setIsOpen] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [email, setEmail] = useState("")

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  const handleSubmit = async(e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    /** 
     * add user email to product 
     * addUserEmailToProduct(productId, email)
    */
    await addUserEmailToProduct(productId, email)
    setIsSubmitting(false);
    setEmail('')
    closeModal();
  }

  return (
    <>
      <button type='button' className='btn' onClick={openModal}>
        Track
      </button>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div"  onClose={closeModal} className="dialog-container">
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0'
              enterTo='opacity-100'
              leave="ease-in durabtion-200"
              leaveFrom="opacity-100"
              leaveTo='opacity-0'
            >
              <Dialog.Overlay className="fixed inset-0" />
            </Transition.Child> 
            <span className="inline-block h-screen align-middle" aria-hidden="true"></span>
            <Transition.Child
              as={Fragment}
              enter="ease-out durabtion-300"
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in durabtion-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <div className="dialog-content">
                <div className="flex flex-col">
                  <div className="flex justify-between">
                    <div className="p-3 border border-gray-200 rounded-10">
                      <Image
                        src="/assets/icons/logo.svg"
                        alt="logo"
                        width= {28}
                        height={28}
                      />
                    </div>
                    <Image
                      src="/assets/icons/x-close.svg"
                      alt="close"
                      width= {24}
                      height={24}
                      className="cursor-pointer"
                      onClick={closeModal}
                    />
                  </div>
                  <h4 className="dialog-head_text">Stay updated with products pricing alerts right in your inbox! </h4>
                  <p className="text-sm text-gray-600 mt-2">Never miss a bargin again with our timely alerts</p>
                </div>
                <form className='flex flex-col mt-5' onSubmit={handleSubmit}>
                  <label htmlFor="email" className='text-sm font-medium text-gray-700'>Email Address</label>
                  <div className="dialog-input_container">
                    <Image
                      src="/assets/icons/mail.svg"
                      alt="mail"
                      width= {18}
                      height={18}
                      className="cursor-pointer"
                    />
                    <input 
                      required 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      id='emial'
                      placeholder='Enter your email'
                      className="dialog-input"
                    />
                  </div>

                  <button type="submit" className="dialog-btn">
                    {isSubmitting ? 'Submitting' : 'Track'}
                  </button>
                </form>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
     
    </>
  )
}

export default Modal