import React, { useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { apiUrl, FileApiResponse, staticUrl } from 'api';
import { Container } from '@mui/material';
import { useParams } from 'react-router';
import { jsonToFormData } from 'utils';
import BackButton from 'components/BackButton';
import SaveButton from 'components/SaveButton';
import { enqueueSnackbar } from 'notistack';

export default function OnlineEditor({id} : {id:number}) {


    const editorRef = React.useRef<any>(null);
    const [file, setFile] = React.useState<FileApiResponse | null>(null);
    const [content, setContent] = React.useState<string | null>(null);

    useEffect(() => {
        fetch(`${apiUrl}/onlineEditor/get`, {
            method: 'POST',
            body: jsonToFormData({
                id: id
            })
        }).then((response) => response.text())
            .then((data) => {
                setContent(data);
            });

        fetch(`${apiUrl}/files/get`, {
            method: 'POST',
            body: jsonToFormData({
                id: id
            })
        }).then((response) => response.json())
            .then((data) => {
                setFile(data as FileApiResponse);
            });
    }, []);

    function save() {
        fetch(`${apiUrl}/onlineEditor/save`, {
            method: 'POST',
            body: jsonToFormData({
                id: id,
                content: editorRef.current.getContent()
            })
        }).then((response) => {
            enqueueSnackbar("Saved!");
        });
    }

    return (
        <>
            <Container>
                {file != null && content != null ? (
                    <Editor
                        tinymceScriptSrc={staticUrl + '/tinymce/js/tinymce/tinymce.min.js'}
                        onInit={(evt, editor) => editorRef.current = editor}
                        initialValue={content}  
                        init={{
                            height: 500,
                            plugins: 'lists table link advlist wordcount image footnotes insertdatetime',
                            toolbar: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link table image footnotes | insertdatetime',
                            insertdatetime_formats: ["%I:%M %p"],
                            branding: false,
                            promotion: false,
                            images_upload_url: `${apiUrl}/onlineEditor/${file.date}/upload`,
                            document_base_url: `${apiUrl}/files/getFile/${file.date}/`
                        }}
                    />
                ) : <>Loading...</>}

                <SaveButton onClick={save}/>

            </Container>
        </>
    );

}