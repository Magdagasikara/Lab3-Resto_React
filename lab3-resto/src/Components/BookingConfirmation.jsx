import Card from 'react-bootstrap/Card';
import RestaurantMini from "../assets/restaurant.jpg"

export default function BookingConfirmation({ bookingConfirmation }) {
    return <>
        <article>
            <Card >{/*style={{ width: '50rem' }}*/}
                <Card.Img className="restaurant-mini" variant="top" src={RestaurantMini} alt="Restaurant picture" />
                <Card.Body>
                    <Card.Title>Thank you for your reservation, {bookingConfirmation.name}! </Card.Title>
                    <Card.Text>
                        Day: {bookingConfirmation.reservationTime} <br />
                        Time: {bookingConfirmation.reservationDurationInHours} h <br />
                        Number of guests: {bookingConfirmation.amountOfGuests}
                    </Card.Text>
                    <Card.Text>
                        No email confirmation has been to {bookingConfirmation.email}.
                    </Card.Text>
                    <Card.Text>
                        See you soon!
                    </Card.Text>
                </Card.Body>

            </Card>
        </article >

    </>
}