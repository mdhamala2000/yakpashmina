import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

export const postData = async (url, formData) => {
    try {
        
        const response = await fetch(apiUrl + url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
            credentials: 'include'
        });


        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            const errorData = await response.json();
            return errorData;
        }

    } catch (error) {
        console.error('Error:', error);
    }

}



export const fetchDataFromApi = async (url) => {
    try {
        const { data } = await axios.get(apiUrl + url, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
        })
        return data;
    } catch (error) {
        console.error(error);
        return error;
    }
}


export const uploadImage = async (url, updatedData ) => {
    var response;
    await axios.put(apiUrl + url, updatedData, {
        withCredentials: true,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }).then((res)=>{
        response=res;
    })
    return response;
   
}



export const editData = async (url, updatedData ) => {
    var response;
    await axios.put(apiUrl + url, updatedData, {
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
        },
    }).then((res)=>{
        response=res;
    })
    return response;
   
}


export const deleteData = async (url ) => {
    const { res } = await axios.delete(apiUrl + url, {
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
        },
    })
    return res;
}