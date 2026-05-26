import axios from "axios";

const defaultOptions = {
	baseURL: import.meta.env.VITE_URL_API,
};

const instance = axios.create(defaultOptions);

instance.interceptors.request.use(function (config) {
	const token = localStorage.getItem('token');
	if (config.headers)
		config.headers.Authorization = token ? `Bearer ${token}` : '';
	if (typeof FormData !== 'undefined' && config.data instanceof FormData && config.headers) {
		delete (config.headers as any)['Content-Type'];
		delete (config.headers as any)['content-type'];
	}
	return config;
});

export default instance;