export function isSelectedDateInPast(selectedDate) {
    const dateToTest = new Date(selectedDate);
    dateToTest.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dateToTest.getTime() < today.getTime();
}
export function isSelectedDateToday(selectedDate) {
    const dateToTest = new Date(selectedDate);
    dateToTest.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dateToTest.getTime() === today.getTime();
}
export function isSelectedDateBookable(selectedDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(today.getMonth() + 1);
    return !isSelectedDateInPast(selectedDate) && selectedDate <= oneMonthLater;
}