import { useState } from 'react';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/esm/Button';
import axios from 'axios'

export default function UserForm({ closeSummaryAndUserForm, API_URI, bookingSummary }) {
    const [customer, setCustomer] = useState(null)
    const [email, setEmail] = useState('')
    const [emailValid, setEmailValid] = useState(true)
    const [name, setName] = useState('')
    const [nameValid, setNameValid] = useState(false)
    const [isCustomerInDb, setIsCustomerInDb] = useState(false)
    const [checkboxValid, setCheckboxValid] = useState(false)

    async function handleSubmitEmail(e) {
        e.preventDefault();
        try {
            console.log(email)
            const emailObject = { email }
            console.log("Sending request at: ", new Date().toISOString());
            const response = await axios.post(`${API_URI}customers/customer`, emailObject);
            console.log("Response received at: ", new Date().toISOString());
            const customerData = response.data;
            setName(customerData.name)
            setIsCustomerInDb(true)
        }
        catch (error) {
            console.log("status code ", error.status)
            console.log(error)
        }
    }
    async function handleSubmitBooking(e) {
        const bookingObject = {
            timeStamp: new Date(),
            amountOfGuests: bookingSummary.amountOfGuests,
            reservationStart: bookingSummary.reservationStart,
            reservationDurationInHours: bookingSummary.reservationDurationInHours,
            email
        }
        if (isCustomerInDb) {
            await axios.post(`${API_URI}bookings/booking/add`, bookingObject);
        }
    }

    async function handleEmailBlur(e) { // blur: when email-field loses focus
        // validate first then check if it exists
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            setEmailValid(false);
        } else {
            setEmailValid(true);
            await handleSubmitEmail(e);
        }
    }
    function handleNameBlur(e) {
        if (name.length < 3) {
            setNameValid(false);
        } else {
            setNameValid(true);
        }
    }
    return <>
        <Form>
            <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={handleEmailBlur}
                    isInvalid={!emailValid}
                />
                <Form.Text className="text-muted">
                    We will save you email to handle your reservations.
                </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicName">
                <Form.Label>Your name</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={handleNameBlur}
                    disabled={!emailValid}
                />
                <Form.Text className="text-muted">
                    We want to welcome you each time you arrive.
                </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicCheckbox">
                <Form.Check
                    type="checkbox"
                    label="I agree to follow you for the rest of my life"
                    onChange={(e) => setCheckboxValid(!checkboxValid)}
                />
                <Form.Text className="text-muted">
                    Obligatory!
                </Form.Text>
            </Form.Group>
            <Button
                variant="secondary"
                type="submit"
                onClick={handleSubmitBooking}
                disabled={!emailValid || !nameValid || !checkboxValid}
            >
                Book it!
            </Button>
        </Form>
    </>
}