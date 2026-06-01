import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
console.log('API URL:', apiUrl);

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
        console.log(error);
        return { error: true, message: error.message, data: null };
    }
}

export const getData = async (url) => {
    try {
        const response = await fetch(apiUrl + url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
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
        return { error: true, message: error.message };
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


export const uploadImages = async (url, formData ) => {
    try {
        const response = await axios.post(apiUrl + url, formData, {
            withCredentials: true,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    } catch (error) {
        console.error("Upload error:", error);
        console.error("Error response:", error.response?.data);
        throw error;
    }
}



export const editData = async (url, updatedData) => {
    try {
        const isToggle = url.includes('/toggle');
        let response;
        
        if (isToggle) {
            const res = await axios.post(apiUrl + url, updatedData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            response = res.data;
        } else {
            const res = await axios.put(apiUrl + url, updatedData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            response = res.data;
        }
        return response;
    } catch (error) {
        console.error('Edit error:', error);
        return error.response?.data || { error: true, success: false, message: 'Network error' };
    }
}





export const deleteImages = async (url,image ) => {
    try {
        const response = await axios.delete(apiUrl + url, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data || response;
    } catch (error) {
        console.error('Delete images error:', error);
        return { error: true, message: error.message };
    }
}


export const deleteData = async (url ) => {
    try {
        const response = await fetch(apiUrl + url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
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

export const putData = async (url, formData) => {
    try {
        const response = await fetch(apiUrl + url, {
            method: 'PUT',
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

export const deleteMultipleData = async (url,data ) => {
    try {
        const response = await axios.delete(apiUrl + url, {
            withCredentials: true,
            data: data,
            headers: {
                'Content-Type': 'application/json',
            },
        })
        return response.data || response;
    } catch (error) {
        console.error('Delete multiple error:', error);
        return { error: true, message: error.message };
    }
}