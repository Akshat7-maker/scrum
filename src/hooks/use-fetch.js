import { useState } from "react";


const useFetch = (cb) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const fn = async (...args) =>{
        setLoading(true);
        setError(null);

        try {
            const res = await cb(...args);
            // console.log("res", res);
            setData(res);
            return res;
            
        } catch (error) {
            setError(error);
            throw error;
            
        }finally{
            setLoading(false);
        }

    }

    return {
        loading,
        error,
        data,
        fn
    }
}

export default useFetch