import Card from 'react-bootstrap/Card';
import UserForm from "./UserForm"

export default function BookingSummary({ bookingSummary, closeSummaryAndUserForm, API_URI }) {
    return <>
        <article>
            <Card style={{ width: '50rem' }}>
                {/* <Card.Img className="card-img" variant="top" src={restaurant.jpeg} alt="Restaurant picture" /> */}
                <Card.Body>
                    <Card.Title>Your reservation:</Card.Title>
                    <Card.Text>
                        Day: {bookingSummary.reservationTime} <br />
                        Time: {bookingSummary.reservationDurationInHours} h <br />
                        Number of guests: {bookingSummary.amountOfGuests}
                    </Card.Text>
                </Card.Body>
                <UserForm closeSummaryAndUserForm={closeSummaryAndUserForm} API_URI={API_URI} bookingSummary={bookingSummary} />
            </Card>
        </article>

    </>

}