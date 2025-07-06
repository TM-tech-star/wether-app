const API_KEY = '32cac26aeb0fbff6e924517ffbd7f98a';
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOMの読み込みを待つ
document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        loading: document.getElementById('loading'),
        error: document.getElementById('error'),
        currentWeather: document.getElementById('currentWeather'),
        forecast: document.getElementById('forecast'),
        cityName: document.getElementById('cityName'),
        weatherIcon: document.getElementById('weatherIcon'),
        temperature: document.getElementById('temperature'),
        description: document.getElementById('description'),
        feelsLike: document.getElementById('feelsLike'),
        humidity: document.getElementById('humidity'),
        windSpeed: document.getElementById('windSpeed'),
        forecastContainer: document.getElementById('forecastContainer'),
        citySearch: document.getElementById('citySearch'),
        searchBtn: document.getElementById('searchBtn'),
        adviceSection: document.getElementById('adviceSection'),
        umbrellaAdvice: document.getElementById('umbrellaAdvice'),
        clothingAdvice: document.getElementById('clothingAdvice')
    };

    function showLoading() {
        elements.loading.style.display = 'block';
        elements.error.style.display = 'none';
        elements.currentWeather.style.display = 'none';
        elements.forecast.style.display = 'none';
        if (elements.adviceSection) {
            elements.adviceSection.style.display = 'none';
        }
    }

    function showError(message) {
        console.error('エラー:', message);
        elements.loading.style.display = 'none';
        elements.error.style.display = 'block';
        elements.error.textContent = message;
        elements.currentWeather.style.display = 'none';
        elements.forecast.style.display = 'none';
        if (elements.adviceSection) {
            elements.adviceSection.style.display = 'none';
        }
    }

    function showWeather() {
        elements.loading.style.display = 'none';
        elements.error.style.display = 'none';
        elements.currentWeather.style.display = 'block';
        elements.forecast.style.display = 'block';
        if (elements.adviceSection) {
            elements.adviceSection.style.display = 'block';
        }
    }

    async function fetchWeatherData(city) {
        showLoading();
        
        try {
            console.log('天気データを取得中:', city);
            const currentResponse = await fetch(
                `${API_BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric&lang=ja`
            );
            
            if (!currentResponse.ok) {
                const errorData = await currentResponse.json();
                console.error('APIエラー:', errorData);
                throw new Error(errorData.message || '都市が見つかりません');
            }
            
            const currentData = await currentResponse.json();
            console.log('現在の天気データ:', currentData);
            
            const forecastResponse = await fetch(
                `${API_BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=ja`
            );
            
            const forecastData = await forecastResponse.json();
            console.log('予報データ:', forecastData);
            
            displayCurrentWeather(currentData);
            displayForecast(forecastData);
            showWeather();
            
        } catch (error) {
            console.error('エラー詳細:', error);
            showError(error.message || 'データの取得に失敗しました');
        }
    }

    function displayCurrentWeather(data) {
        elements.cityName.textContent = data.name;
        elements.weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
        elements.weatherIcon.alt = data.weather[0].description;
        elements.temperature.textContent = `${Math.round(data.main.temp)}°C`;
        elements.description.textContent = data.weather[0].description;
        elements.feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
        elements.humidity.textContent = `${data.main.humidity}%`;
        elements.windSpeed.textContent = `${data.wind.speed} m/s`;
        
        displayAdvice(data);
    }

    function displayAdvice(data) {
        if (!elements.umbrellaAdvice || !elements.clothingAdvice) return;
        
        const temp = data.main.temp;
        const weatherMain = data.weather[0].main;
        const pop = data.pop || 0;
        
        // 傘のアドバイス
        let umbrellaAdvice = '';
        if (weatherMain === 'Rain' || weatherMain === 'Drizzle') {
            umbrellaAdvice = '傘が必要です！雨が降っています。';
        } else if (weatherMain === 'Snow') {
            umbrellaAdvice = '雪が降っています。傘と防寒対策をしましょう。';
        } else if (weatherMain === 'Thunderstorm') {
            umbrellaAdvice = '雷雨です！外出は控えた方が良いでしょう。';
        } else if (pop > 0.5) {
            umbrellaAdvice = '降水確率が高いので、念のため傘を持っていきましょう。';
        } else if (pop > 0.3) {
            umbrellaAdvice = '降水確率があるので、折りたたみ傘があると安心です。';
        } else {
            umbrellaAdvice = '傘は必要なさそうです。';
        }
        
        // 服装アドバイス
        let clothingAdvice = '';
        if (temp < 5) {
            clothingAdvice = '非常に寒いです！厚手のコート、マフラー、手袋が必要です。';
        } else if (temp < 10) {
            clothingAdvice = '寒いです。冬物のコートやジャケットを着用しましょう。';
        } else if (temp < 15) {
            clothingAdvice = '肌寒いです。セーターや軽めのジャケットがおすすめです。';
        } else if (temp < 20) {
            clothingAdvice = '過ごしやすい気温です。長袖シャツや薄手の上着があると良いでしょう。';
        } else if (temp < 25) {
            clothingAdvice = '暖かいです。半袖でも快適に過ごせます。';
        } else if (temp < 30) {
            clothingAdvice = '暑いです。薄着で、日差し対策をしましょう。';
        } else {
            clothingAdvice = '非常に暑いです！涼しい服装で、熱中症対策を忘れずに。';
        }
        
        // 湿度による補足
        if (data.main.humidity > 80) {
            clothingAdvice += ' 湿度が高いので、通気性の良い服装がおすすめです。';
        }
        
        // 風速による補足
        if (data.wind.speed > 5) {
            clothingAdvice += ' 風が強いので、風を通しにくい上着があると良いでしょう。';
        }
        
        elements.umbrellaAdvice.textContent = umbrellaAdvice;
        elements.clothingAdvice.textContent = clothingAdvice;
    }

    function displayForecast(data) {
        elements.forecastContainer.innerHTML = '';
        
        const dailyData = {};
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000).toLocaleDateString('ja-JP');
            if (!dailyData[date]) {
                dailyData[date] = item;
            }
        });
        
        Object.values(dailyData).slice(0, 5).forEach(day => {
            const date = new Date(day.dt * 1000);
            const dayName = date.toLocaleDateString('ja-JP', { weekday: 'short' });
            const monthDay = `${date.getMonth() + 1}/${date.getDate()}`;
            
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            forecastItem.innerHTML = `
                <div class="forecast-date">${dayName}<br>${monthDay}</div>
                <div class="forecast-icon">
                    <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}">
                </div>
                <div class="forecast-temp">${Math.round(day.main.temp)}°C</div>
                <div class="forecast-desc">${day.weather[0].description}</div>
            `;
            
            elements.forecastContainer.appendChild(forecastItem);
        });
    }

    // イベントリスナーの設定
    if (elements.searchBtn) {
        elements.searchBtn.addEventListener('click', () => {
            const city = elements.citySearch.value.trim();
            if (city) {
                fetchWeatherData(city);
            }
        });
    }

    if (elements.citySearch) {
        elements.citySearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const city = elements.citySearch.value.trim();
                if (city) {
                    fetchWeatherData(city);
                }
            }
        });
    }

    // 初期読み込み
    console.log('アプリを初期化中...');
    fetchWeatherData('Tokyo');
});
