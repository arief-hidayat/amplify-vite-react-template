import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const client = generateClient<Schema>();

function App() {
    const [schedules, setSchedules] = useState<Array<Schema["AdsSchedule"]["type"]>>([]);
    const [startDateTime, setStartDateTime] = useState<Date | null>(new Date(new Date().getTime() + 30 * 1000));
    const [endDateTime, setEndDateTime] = useState<Date | null>(new Date(new Date().getTime() + 150 * 1000));
    const [code, setCode] = useState<string>("");
    const defaultAdsDurationSeconds = 60
    useEffect(() => {
        client.models.AdsSchedule.observeQuery().subscribe({
            next: (data) => setSchedules([...data.items]),
        });
    }, []);

    function createSchedules() {
        if (startDateTime && endDateTime) {
            client.models.AdsSchedule.create({
                code: code,
                start: startDateTime.toISOString(),
                end: endDateTime.toISOString()
            });
        } else {
            alert("Please select both start and end date/times");
        }
    }

    function addSeconds(date: Date, seconds: number) {
        return new Date(date.getTime() + seconds * 1000);
    }

    function formatDateTime(dateTimeString: string): string {
        const date = new Date(dateTimeString);
        return date.toLocaleString();
    }

    const handleCodeChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCode(event.target.value);
    };

    return (
        <main>
            <h1>My schedules</h1>
            <div>
                <label>Ad Code: </label>
                <textarea
                    value={code}
                    onChange={handleCodeChange}
                    rows={2}
                    cols={50}
                    placeholder="Enter your ad code here..."
                />
            </div>
            <div>
                <label>Start Date and Time: </label>
                <DatePicker
                    selected={startDateTime}
                    onChange={(date: Date | null) => {
                        if (date) {
                            setStartDateTime(date)
                            if (!endDateTime || date >= endDateTime) {
                                setEndDateTime(addSeconds(date, defaultAdsDurationSeconds))
                            }
                        }
                    }}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="MMMM d, yyyy h:mm aa"
                />
            </div>
            <div>
                <label>End Date and Time: </label>
                <DatePicker
                    selected={endDateTime}
                    onChange={(date: Date | null) => {
                        if (date) {
                            setEndDateTime(date)
                            if (!startDateTime || date <= startDateTime) {
                                setStartDateTime(addSeconds(date, -1 * defaultAdsDurationSeconds))
                            }
                        }
                    }}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="MMMM d, yyyy h:mm aa"
                />
            </div>
            <button onClick={createSchedules}>+ new</button>
            <ul>
                {schedules.map((schedule) => (
                    <li key={schedule.id}>
                        Start: {formatDateTime(schedule.start)} -
                        End: {formatDateTime(schedule.end)}
                    </li>
                ))}
            </ul>
        </main>
    );
}

export default App;
