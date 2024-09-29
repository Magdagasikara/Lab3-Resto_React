import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import BookingSummary from "./BookingSummary"
import "react-day-picker/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

// import max antal platser en kund kan boka
// import öppettider

//todo
//hämta info om de är bokningsbara för antalet personer
//ska inte gå att trycka på ADD om fel datum etc
// kan jag använda CreateContext här för API_URI?
// UTC tiden

export default function BookingCreate() {
    const [selectedDate, setSelectedDate] = useState();
    const maxSeatsPerBooking = 8;
    const [openingHours, setOpeningHours] = useState([[11, 13], [17, 23]]);
    const [numberOfGuests, setNumberOfGuests] = useState();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(today.getMonth() + 1);
    const [visitDurationInMin, setVisitDurationInMin] = useState(90)
    const [visitDurationText, setVisitDurationText] = useState("1h 30m")
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
    const [bookingSummary, setBooking] = useState(null)
    const API_URI = "https://localhost:7212/api/"

    useEffect(() => {
        const sendHeight = () => {
            const height = document.body.scrollHeight; // Beräkna höjden på React-innehållet
            window.parent.postMessage({ height }, "*"); // Skicka höjd till föräldrafönstret (iframe-värden)
        };

        // Skicka höjden när komponenten först renderas
        sendHeight();

        // Skicka höjden när fönsterstorleken ändras
        window.addEventListener("resize", sendHeight);

        // Skapa en MutationObserver som observerar förändringar i DOM:en och justerar höjden
        const observer = new MutationObserver(() => {
            sendHeight();
        });

        // Observera förändringar i hela dokumentet
        observer.observe(document.body, {
            childList: true, // Lyssnar på förändringar i barnen (nytt element tillagt, borttaget)
            subtree: true,   // Observerar förändringar i alla underliggande element
            attributes: true // Lyssnar på attributförändringar (t.ex. stiländringar)
        });

        return () => {
            // Rensa event och observer när komponenten avmonteras
            window.removeEventListener("resize", sendHeight);
            observer.disconnect(); // Sluta observera DOM-förändringar
        };
    }, []);

    function isSelectedDateInPast(selectedDate) {
        const dateToTest = new Date(selectedDate);
        dateToTest.setHours(0, 0, 0, 0);
        return dateToTest < today;
    }
    function isSelectedDateBookable(selectedDate) {
        return !isSelectedDateInPast(selectedDate) && selectedDate <= oneMonthLater;
    }

    const handleNumberOfGuestsChange = (number) => setNumberOfGuests(number);
    const handleVisitDurationChange = (minutes) => {
        setVisitDurationInMin(minutes);
        setVisitDurationText(Math.floor(minutes / 60) + "h " + (minutes % 60).toString().padStart(2, '0') + "m")
    }
    const handleTimeSlotChange = (slot) => setSelectedTimeSlot(slot);

    const generateTimeSlots = () => {
        let slots = [];
        openingHours.forEach(hours => {
            const [startHour, endHour] = hours;
            for (let hour = startHour; hour < endHour; hour++) {
                slots.push(`${hour}:00`);
                slots.push(`${hour}:30`);
            }
        });
        return slots.filter((time) => {
            const [hours, minutes] = time.split(':').map(Number);

            // create startTime as date for this timeslot
            const startTime = new Date(selectedDate);
            startTime.setHours(hours);
            startTime.setMinutes(minutes);

            // calculate endTime from startTime and visitDurationInMin
            const endTime = new Date(startTime);
            endTime.setMinutes(startTime.getMinutes() + visitDurationInMin);

            // filter away those timeslots that end after opening hours
            return openingHours.some(([start, end]) => {
                const openingStartTime = new Date(selectedDate);
                openingStartTime.setHours(start);
                openingStartTime.setMinutes(0);
                const openingEndTime = new Date(selectedDate);
                openingEndTime.setHours(end);
                openingEndTime.setMinutes(0);

                // timeslot should start and end withing opening hours
                const isStartWithinOpening = startTime >= openingStartTime && startTime <= openingEndTime;
                const isEndWithinOpening = endTime >= openingStartTime && endTime <= openingEndTime;

                return isStartWithinOpening && isEndWithinOpening;
            });
        });
    }

    function handleSubmit(e) {
        e.preventDefault();
        const [hour, minutes] = selectedTimeSlot.split(':').map(Number);
        let reservationStart = new Date(selectedDate);
        reservationStart.setHours(hour - reservationStart.getTimezoneOffset() / 60);
        reservationStart.setMinutes(minutes);
        let reservationTime = new Date(selectedDate);
        reservationTime.setHours(hour);
        reservationTime.setMinutes(minutes);
        console.log(reservationStart)

        const reservationDurationInHours = visitDurationInMin / 60;

        const bookingToSet = {
            amountOfGuests: numberOfGuests,
            reservationStart: reservationStart.toISOString(),
            reservationTime: reservationTime.toLocaleString(),
            reservationDurationInHours
        }
        setBooking(bookingToSet);
        console.log("bookingSummary ", bookingToSet)
    }

    function closeSummaryAndUserForm() {
        setBooking(null)
    }

    function renderSummaryAndUserForm(bookingSummary) {
        if (bookingSummary !== null) {
            return <>
                <BookingSummary bookingSummary={bookingSummary} closeSummaryAndUserForm={closeSummaryAndUserForm} API_URI={API_URI} />
            </>;
        }
    }
    return (
        <>
            <form onSubmit={handleSubmit}>
                <h2>NEW RESERVATION</h2>
                <section>
                    <h3>Number of guests</h3>
                    <ToggleButtonGroup
                        type="radio"
                        name="btnradiogr"
                        value={numberOfGuests}
                        onChange={(number) => handleNumberOfGuestsChange(number)}
                        aria-label="Choose number of guests">
                        {[...Array(maxSeatsPerBooking)].map((_, i) => (
                            <ToggleButton key={i + 1} type="radio" id={`btnradio${i + 1}`} value={i + 1} variant="outline-secondary">
                                {i + 1}
                            </ToggleButton>))}
                    </ToggleButtonGroup>
                </section>
                <section>
                    <DayPicker
                        mode="single"
                        // showOutsideDays
                        numberOfMonths={2}
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        footer={
                            selectedDate ?
                                isSelectedDateBookable(selectedDate) ?
                                    `Selected: ${selectedDate.toLocaleDateString()} `
                                    : isSelectedDateInPast(selectedDate) ?
                                        `Day ${selectedDate.toLocaleDateString()} has already passed`
                                        : 'You can only book one month ahead'

                                : "Pick a day."
                        }
                    />
                </section>
                {
                    !isSelectedDateInPast(selectedDate) && selectedDate <= oneMonthLater ?
                        <>
                            <section>
                                <DropdownButton
                                    id="dropdown-basic-button"
                                    variant="Secondary"
                                    title={`Length of your visit: ${visitDurationText}`}
                                >
                                    <Dropdown.Item onClick={() => handleVisitDurationChange(90)}>1h 30m</Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleVisitDurationChange(120)}>2h 00m</Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleVisitDurationChange(150)}>2h 30m</Dropdown.Item>
                                </DropdownButton>
                            </section >
                            <section>
                                <ToggleButtonGroup
                                    type="radio"
                                    name="timeslots"
                                    aria-label="Time slots"
                                    value={selectedTimeSlot}
                                    onChange={(slot) => handleTimeSlotChange(slot)}
                                >
                                    {selectedDate && generateTimeSlots().map((slot, i, isBookable) => (
                                        <ToggleButton key={i} value={slot} type="radio" id={`btn2radio${i + 1}`} variant="outline-secondary" disabled={!isBookable}>
                                            {slot}
                                        </ToggleButton>
                                    ))}
                                </ToggleButtonGroup>
                            </section>
                        </>
                        : <></>
                }
                <button
                    type="submit"
                    disabled={!isSelectedDateBookable(selectedDate)}
                >
                    ADD
                </button>
                <button type="button" >Cancel</button>
            </form>
            {renderSummaryAndUserForm(bookingSummary)}
        </>
    )
}
