import { Card, CardContent, Container, Grid } from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { apiUrl, ByDateApiResponse, dateFormat } from 'api';
import FileTable from 'components/FileTable';
import dayjs, { Dayjs } from 'dayjs';
import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { jsonToFormData } from 'utils';

export default function OnThisDay() {
    const navigate = useNavigate();
    var dateUrlParam = useParams().date;

    let date = dayjs().set('year', 2000);

    if (dateUrlParam) {
        date = dayjs(dateUrlParam, dateFormat);
    } else {
        navigate(`/otd/${date.format(dateFormat)}`);
    }

    const [datePickerValue, setDatePickerValue] = React.useState<Dayjs>(date);
    const [month, setMonth] = React.useState<number>(date.month());
    const [year, setYear] = React.useState<number>(date.year());
    const [files, setFiles] = React.useState<{ [key: number]: ByDateApiResponse } | null>(null);

    useEffect(() => {
        fetch(`${apiUrl}/files/onThisDate`, {
            method: 'POST',
            body: jsonToFormData({
                date: datePickerValue.format(dateFormat)
            })
        })
            .then((response) => response.json())
            .then((data: ByDateApiResponse) => {
                var files: { [key: number]: ByDateApiResponse } = {};

                data.forEach((file) => {
                    const dateKey = dayjs(file.date).year();
                    if (!files[dateKey]) {
                        files[dateKey] = [];
                    }
                    files[dateKey].push(file);
                });
                setFiles(files);
            });

        navigate(`/otd/${datePickerValue.format(dateFormat)}`);
    }, [datePickerValue]);

    return (
        <Container>
            <Grid container spacing={2}>
                <Grid size={4}>
                    <DateCalendar
                        views={['day']}
                        minDate={dayjs("2000-01-01")}
                        maxDate={dayjs("2000-12-31")}
                        value={datePickerValue}
                        onChange={(newValue) => setDatePickerValue(newValue as Dayjs)}
                    />
                </Grid>
                <Grid size={8}>
                    {files && Object.keys(files).length > 0 ? Object.keys(files).sort().map((year) => (
                        <>
                            <h2>{year}</h2>
                            <FileTable files={files[year as unknown as number]} openInDialog={true}/>
                        </>
                    )) : null}
                </Grid>

            </Grid>
        </Container >
    );

}

