import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { isSelectedDateInPast, isSelectedDateBookable, isSelectedDateToday } from "../Services/DateService";
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import BookingCreateUser from "./BookingCreateUser"
import BookingConfirmation from "./BookingConfirmation"
import "react-day-picker/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

export default function BookingCreate() {
    const [selectedDate, setSelectedDate] = useState();
    const maxSeatsPerBooking = 8;
    const [openingHours, setOpeningHours] = useState([[11, 13], [17, 23]]);
    const [numberOfGuests, setNumberOfGuests] = useState(1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(today.getMonth() + 1);
    const [visitDurationInMin, setVisitDurationInMin] = useState(90)
    const [visitDurationText, setVisitDurationText] = useState("1h 30m")
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
    const [bookingSummaryPrel, setBookingPrel] = useState(null);
    const [bookingConfirmation, setBookingConfirmation] = useState(null);
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);
    const API_URI = "https://localhost:7212/api/"

    // Sends height needed for the React component back to Frontend with MVC
    useEffect(() => {
        const sendHeight = () => {
            const height = document.body.scrollHeight;
            window.parent.postMessage({ height }, "*");
        };

        sendHeight();

        window.addEventListener("resize", sendHeight);

        const observer = new MutationObserver(() => {
            sendHeight();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true
        });

        return () => {
            window.removeEventListener("resize", sendHeight);
            observer.disconnect();
        };
    }, []);

    // Updates possible timeslots on each change of selected date, visit duration or amount of guests
    useEffect(() => {
        if (selectedDate) {
            generateTimeSlots().then((slots) => {
                setAvailableTimeSlots(slots);
            });
        }
    }, [selectedDate, visitDurationInMin, numberOfGuests]);


    // Change handlers
    const handleNumberOfGuestsChange = (number) => setNumberOfGuests(number);
    const handleVisitDurationChange = (minutes) => {
        setVisitDurationInMin(minutes);
        setVisitDurationText(Math.floor(minutes / 60) + "h " + (minutes % 60).toString().padStart(2, '0') + "m")
    }
    const handleTimeSlotChange = (slot) => setSelectedTimeSlot(slot);

    // Generate time slots dependant on opening hours, visit duration and amount of guests:
    // All possible timeslots are displayed for the selected date based on opening hours and visit duration (whole booking need to start and end within opening hours).
    // Timeslots that have passed (or are within 2h from now) or don't have enough places for the whole reservation time are disabled.
    const generateTimeSlots = async () => {
        let slots = [];
        openingHours.forEach(hours => {
            const [startHour, endHour] = hours;
            for (let hour = startHour; hour < endHour; hour++) {
                slots.push({ time: `${hour}:00`, isBookable: false });
                slots.push({ time: `${hour}:30`, isBookable: false });
            }
        });
        const filteredSlotsPromises = slots.map(async (slot) => {
            const [hours, minutes] = slot.time.split(':').map(Number);

            // create startTime as date for this timeslot
            const startTime = new Date(selectedDate);
            startTime.setHours(hours);
            startTime.setMinutes(minutes);

            // calculate endTime from startTime and visitDurationInMin
            const endTime = new Date(startTime);
            endTime.setMinutes(startTime.getMinutes() + visitDurationInMin);

            // checkk if timeslots start and end within opening hours
            const isWithinOpeningHours = openingHours.some(([start, end]) => {

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
            if (isWithinOpeningHours) {
                try {
                    console.log(slot.time, " kom in för startTime ", startTime.toISOString());
                    const response = await axios.get(`${API_URI}tables/places/available`, {
                        params: {
                            time: startTime.toLocaleString('sv-SE'),
                            reservationHours: visitDurationInMin / 60
                        }
                    });

                    // timeslot bookable if enough places AND not too early (if today must be two hours from now)
                    const datetimeInTwoHours = new Date();
                    datetimeInTwoHours.setHours(datetimeInTwoHours.getHours() + 2);
                    const isTodayButTooEarly = isSelectedDateToday(selectedDate) && startTime < datetimeInTwoHours;
                    if (response.data >= numberOfGuests && !isTodayButTooEarly) {
                        return { ...slot, isBookable: true };
                    }
                    else {
                        return slot;
                    }
                } catch (error) {
                    console.error("Error fetching available places:", error);
                }
            }
            return null;
        });
        const filteredSlots = await Promise.all(filteredSlotsPromises);
        // Filter away all the nulls (invalid slots)
        const validSlots = filteredSlots.filter(slot => slot !== null);

        console.log("Validerade slots:", validSlots);

        return validSlots;
    }

    // Handle submit - summary of chosen day, timeslot and duration - and sets preliminary booking which sends user to user form
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

        const bookingToSetPrel = {
            amountOfGuests: numberOfGuests,
            reservationStart: reservationStart.toISOString(),
            reservationTime: reservationTime.toLocaleString(),
            reservationDurationInHours
        }
        setBookingPrel(bookingToSetPrel);
        console.log("bookingSummaryPrel ", bookingToSetPrel)
    }

    // Once booked restart the component
    function closeSummaryAndUserForm() {
        setBooking(null);
        setIsBookingConfirmed(false);
    }

    return (
        <>
            {bookingSummaryPrel ?
                isBookingConfirmed ?
                    <BookingConfirmation bookingConfirmation={bookingConfirmation} />
                    : <BookingCreateUser bookingSummaryPrel={bookingSummaryPrel} setIsBookingConfirmed={setIsBookingConfirmed} setBookingConfirmation={setBookingConfirmation} closeSummaryAndUserForm={closeSummaryAndUserForm} API_URI={API_URI} />
                : (
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
                                            isSelectedDateToday(selectedDate) ?
                                                `Selected: ${selectedDate.toLocaleDateString()} (today). You can only book slots starting two hours from now.`
                                                : `Selected: ${selectedDate.toLocaleDateString()} `
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
                                            {selectedDate && availableTimeSlots.map((slot, i) => (
                                                <ToggleButton
                                                    key={i}
                                                    value={slot.time}
                                                    type="radio"
                                                    id={`btn2radio${i + 1}`}
                                                    variant="outline-secondary"
                                                    disabled={!slot.isBookable}
                                                    style={!slot.isBookable ? { textDecoration: 'line-through', color: 'gray' } : {}}
                                                >
                                                    {slot.time}
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
                )
            }
        </>
    )

}
