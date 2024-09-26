import { useState } from "react";
import { DayPicker } from "react-day-picker";
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import "react-day-picker/style.css";
import Dropdown from 'react-bootstrap/Dropdown';
import "bootstrap/dist/css/bootstrap.min.css";

import DropdownButton from 'react-bootstrap/DropdownButton';

// import max antal platser en kund kan boka
// import öppettider

//todo
//time slots måste sluta inom öppettider
//hämta info om de är bokningsbara för antalet personer
//spara alla states

export default function MyDatePicker() {
    const [selectedDate, setSelectedDate] = useState();
    const maxSeatsPerBooking = 8;
    const [openingHours, setOpeningHours] = useState([[11, 13], [17, 23]]);
    const [numberOfGuests, setNumberOfGuests] = useState();
    const today = new Date();
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(today.getMonth() + 1);
    const [visitDurationInMin, setVisitDurationInMin] = useState(90)

    const handleNumberOfGuestsChange = (number) => setNumberOfGuests(number);
    console.log(numberOfGuests)
    const handleVisitDurationChange = (minutes) => setVisitDurationInMin(minutes);

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

            // Skapa en ny tid baserat på den valda tiden
            const startTime = new Date(selectedDate);
            startTime.setHours(hours);
            startTime.setMinutes(minutes);

            // Beräkna sluttiden genom att lägga till sittningslängden (visitDurationInMin)
            const endTime = new Date(startTime);
            endTime.setMinutes(startTime.getMinutes() + visitDurationInMin);

            // only within opening hours (the whole visit duration)
            return openingHours.some(([start, end]) => {
                const endHour = endTime.getHours();
                const endMinute = endTime.getMinutes();
                return endHour < end || (endHour === end && endMinute === 0);
            });
        });
    }
    return (/*onSubmit={handleSubmit}*/
        <form >
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
                            selectedDate < today ?
                                `Day ${selectedDate.toLocaleDateString()} has already passed`
                                : selectedDate > oneMonthLater ?
                                    'You can only book one month ahead'
                                    : `Selected: ${selectedDate.toLocaleDateString()} `
                            : "Pick a day."
                    }
                />
            </section>
            {
                selectedDate >= today && selectedDate <= oneMonthLater ?
                    <>
                        <section>
                            {/* <h4>{`Selected: ${selectedDate.toLocaleDateString()} `} </h4> */}
                            <DropdownButton id="dropdown-basic-button" variant="Secondary" title="Length of your visit">
                                <Dropdown.Item onClick={() => handleVisitDurationChange(90)}>1h 30m</Dropdown.Item>
                                <Dropdown.Item onClick={() => handleVisitDurationChange(120)}>2h 00m</Dropdown.Item>
                                <Dropdown.Item onClick={() => handleVisitDurationChange(150)}>2h 30m</Dropdown.Item>
                            </DropdownButton>
                        </section >
                        <section>
                            <h3>Time</h3>
                            <ToggleButtonGroup type="radio" name="timeslots" aria-label="Time slots">
                                {console.log(visitDurationInMin)}
                                {console.log(openingHours)}
                                {console.log(generateTimeSlots())}
                                {selectedDate && generateTimeSlots().map((slot, i) => (
                                    <button key={i} value={slot}>{slot}</button>
                                ))}
                            </ToggleButtonGroup>
                        </section>
                    </>
                    : <></>
            }
            <button type="submit">ADD</button>
            <button type="button" >Cancel</button>
        </form>
    )
}
