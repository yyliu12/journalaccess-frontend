import React, { useEffect } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { apiUrl, dateFormat } from 'api';
import dayjs, { Dayjs } from 'dayjs';
import { jsonToFormData } from 'utils';
import { Badge } from '@mui/material';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';

function dotDiv() {
    return <div style={{
        width: "5px",
        height: "5px",
        borderRadius: "50%",
        backgroundColor: "black",
        pointerEvents: "none",
    }}></div>
}

function JournalDatePickerDay({ datesWithFiles, ...dateComponentProps }: any) {
    return (
        <Badge
            key={dateComponentProps.day.toString()}
            overlap="circular"
            badgeContent={
                datesWithFiles.some((d: Dayjs) => d.isSame(dateComponentProps.day, 'day')) ? dotDiv() : null
            }
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
            }}
            sx={{
                '& .MuiBadge-badge': {
                    right: '50%'
                },
                '.MuiBadge-standard': {
                    pointerEvents: 'none',
                },
                fontSize: '5rem',
            }}
        >
            <PickersDay {...dateComponentProps} />
        </Badge>
    );

}


export default function JournalDatePicker({
    date,
    setDate,
    onEnter = () => {},
    onClose = () => {}
}: {
    date: Dayjs,
    setDate: React.Dispatch<React.SetStateAction<Dayjs>>,
    onEnter?: () => void,
    onClose?: () => void
}) {
    const [datesWithFiles, setDatesWithFiles] = React.useState<Dayjs[]>([]);
    const [viewDate, setViewDate] = React.useState<Dayjs>(dayjs());
    const inputRef = React.useRef<HTMLInputElement>(null);

    inputRef.current?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onEnter();
        }
    });

    useEffect(() => {
        fetch(apiUrl + "/files/datesWithFiles", {
            method: 'POST',
            body: jsonToFormData({
                "month": viewDate.month() + 1, // Convert to 1-indexed month
                "year": viewDate.year(),
            }),
        }).then((response) => {
            return response.json();
        }).then((data) => {
            setDatesWithFiles(data.map((dateString: string) => dayjs(dateString))); // Assuming the API returns an array of dates
        });
    }, [viewDate]);



    return (
        <DatePicker
            format={dateFormat}
            value={date}
            onChange={(date) => setDate(date as Dayjs)}
            onMonthChange={(newMonth) => setViewDate(newMonth)}
            onYearChange={(newYear) => setViewDate(newYear)}
            slots={{
                day: JournalDatePickerDay
            }}
            slotProps={{
                day: {
                    datesWithFiles: datesWithFiles
                } as any
            }}
            ref={inputRef}
            onClose={onClose}
        />
    );
}


