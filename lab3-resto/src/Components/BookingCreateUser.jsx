import Card from 'react-bootstrap/Card';
// import UserForm from "./UserForm"
import { useState } from 'react';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/esm/Button';
import axios from 'axios'

export default function BookingCreateUser({ bookingSummaryPrel, setIsBookingConfirmed, setBookingConfirmation, closeSummaryAndUserForm, API_URI }) {
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
            const response = await axios.post(`${API_URI}customers/customer`, emailObject);
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
        e.preventDefault()
        const customerObject = {
            name,
            email
        }
        if (!isCustomerInDb) {
            const responseCustomer = await axios.post(`${API_URI}customers/customer/add`, customerObject);
            if (!(responseCustomer.status >= 200 && responseCustomer.status < 300)) {
                console.log("problem med customer/add!")
            }
        } else {
            const responseCustomer = await axios.patch(`${API_URI}customers/customer/update`, customerObject);
            if (!(responseCustomer.status >= 200 && responseCustomer.status < 300)) {
                console.log("problem med customer/update!")
            }
        }
        const bookingObject = {
            timeStamp: new Date(),
            amountOfGuests: bookingSummaryPrel.amountOfGuests,
            reservationStart: bookingSummaryPrel.reservationStart,
            reservationDurationInHours: bookingSummaryPrel.reservationDurationInHours,
            email
        }
        console.log(bookingObject)
        const responseBooking = await axios.post(`${API_URI}bookings/booking/add`, bookingObject);
        if (!(responseBooking.status >= 200 && responseBooking.status < 300)) {
            console.log("problem med booking/add!")
        }
        else {
            // summary!
            console.log("wow we made it")
            setIsBookingConfirmed(true);
            const bookingConfirmation = {
                amountOfGuests: bookingSummaryPrel.amountOfGuests,
                reservationTime: bookingSummaryPrel.reservationTime,
                reservationDurationInHours: bookingSummaryPrel.reservationDurationInHours,
                email,
                name
            }
            setBookingConfirmation(bookingConfirmation)
            console.log(bookingConfirmation)
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
        <article>
            <Card style={{ width: '50rem' }}>
                {/* <Card.Img className="card-img" variant="top" src={restaurant.jpeg} alt="Restaurant picture" /> */}
                <Card.Body>
                    <Card.Title>Your reservation:</Card.Title>
                    <Card.Text>
                        Day: {bookingSummaryPrel.reservationTime} <br />
                        Time: {bookingSummaryPrel.reservationDurationInHours} h <br />
                        Number of guests: {bookingSummaryPrel.amountOfGuests}
                    </Card.Text>
                </Card.Body>
                <Form className="userForm">
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
            </Card>
        </article>

    </>

}