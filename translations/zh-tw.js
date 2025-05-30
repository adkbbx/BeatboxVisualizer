/**
 * 🇹🇼 Chinese Traditional Translations - Vibecoding Fireworks App
 * 
 * Chinese Traditional translation file for all user-facing text content.
 * Core UI translations completed to match English template.
 */

export const translations = {
    // UI Controls and Navigation
    ui: {
        buttons: {
            start: "開始",
            stop: "停止",
            test: "測試",
            settings: "設定",
            hide: "隱藏",
            show: "顯示",
            close: "關閉設定",
            reset: "重置",
            load: "載入",
            preview: "預覽",
            discover: "發現",
            clearAll: "清除全部",
            selectFiles: "選擇檔案",
            ok: "確定",
            cancel: "取消"
        },
        modes: {
            fireworks: "煙火",
            bubbles: "氣泡"
        },
        tabs: {
            animationImages: "動畫圖像",
            backgroundImages: "背景圖像",
            presets: "預設"
        },
        status: {
            starting: "啟動中...",
            stopping: "停止中...",
            loading: "載入中...",
            discovering: "搜尋中...",
            clearing: "清除中...",
            testing: "測試中...",
            uploading: "上傳中...",
            processing: "處理中..."
        },
        language: {
            selector: "語言",
            english: "English",
            japanese: "日本語",
            chineseSimplified: "简体中文",
            chineseTraditional: "繁體中文"
        }
    },

    // Audio System
    audio: {
        status: {
            active: "音訊狀態：活躍",
            inactive: "音訊狀態：非活躍",
            starting: "音訊狀態：啟動中...",
            stopping: "音訊狀態：停止中...",
            error: "音訊狀態：錯誤",
            failed: "音訊狀態：啟動失敗",
            denied: "麥克風存取被拒絕",
            unsupported: "此瀏覽器不支援音訊"
        },
        instructions: {
            main: "發出更大聲、持續的聲音來啟動動畫。持續發聲讓它們繼續上升。非常大的聲音將觸發所有活躍的動畫！🔊",
            detection: "發出更大聲、持續的聲音來開始動畫",
            inactive: "麥克風非活躍 - 未檢測到聲音",
            tapToStart: "點擊麥克風按鈕開始音訊檢測"
        },
        errors: {
            permissionDenied: "麥克風權限被拒絕。請在瀏覽器設定中啟用麥克風存取。",
            deviceNotFound: "未找到麥克風裝置。",
            deviceBusy: "麥克風正被其他應用程式使用。",
            generic: "無法存取麥克風。請檢查您的裝置設定。"
        },
        title: "🎤 音訊和聲音設定",
        microphoneSensitivity: "麥克風敏感度",
        microphoneSensitivityDesc: "麥克風對聲音和音訊的敏感度。",
        launchSensitivity: "啟動敏感度",
        launchSensitivityDesc: "啟動煙火所需的聲音大小。",
        burstSensitivity: "爆發敏感度",
        burstSensitivityDesc: "一次爆發所有氣泡所需的音量大小。",
        quickResponse: "快速回應",
        quickResponseDesc: "應用程式對突然聲音的回應速度。",
        testSounds: "測試動畫聲音",
        testSoundsDesc: "測試動畫（煙火/氣泡）時播放真實的發射和爆炸聲音。",
        soundVolume: "聲音音量",
        soundVolumeDesc: "動畫音效的音量級別。",
        volumeThreshold: "音量閾值",
        volumeThresholdDesc: "觸發動畫所需的最小音量級別。"
    },

    // Settings Panel
    settings: {
        title: "動畫設定",
        tabs: {
            audio: "🎤 音訊",
            fireworks: "🎆 煙火",
            bubbles: "🫧 氣泡",
            effects: "✨ 效果",
            images: "🖼️ 圖像",
            colors: "🎨 顏色"
        },
        audio: {
            title: "🎤 音訊和聲音設定",
            microphoneSensitivity: "麥克風敏感度",
            microphoneSensitivityDesc: "麥克風對聲音和音訊的敏感度。",
            launchSensitivity: "啟動敏感度",
            launchSensitivityDesc: "啟動煙火所需的聲音大小。",
            burstSensitivity: "爆發敏感度",
            burstSensitivityDesc: "一次爆發所有氣泡所需的音量大小。",
            quickResponse: "快速回應",
            quickResponseDesc: "應用程式對突然聲音的回應速度。",
            testSounds: "測試動畫聲音",
            testSoundsDesc: "測試動畫（煙火/氣泡）時播放真實的發射和爆炸聲音。",
            soundVolume: "聲音音量",
            soundVolumeDesc: "動畫音效的音量級別。",
            volumeThreshold: "音量閾值",
            volumeThresholdDesc: "觸發動畫所需的最小音量級別。"
        },
        fireworks: {
            title: "🎆 煙火設定",
            launchControls: "🚀 發射控制",
            launchPosition: "🎯 發射位置",
            positionMode: "位置模式",
            positionModeDesc: "煙火在螢幕底部的定位方式",
            centerOnly: "僅中央",
            rangeFromCenter: "從中央範圍",
            randomAcrossScreen: "螢幕隨機",
            launchSpread: "發射擴散",
            launchSpreadDesc: "發射區域的寬度（0% = 中心點，100% = 整個螢幕寬度）",
            centerOnlyLabel: "僅中央",
            fullWidthLabel: "全寬",
            launchAngle: "📐 發射角度",
            angleMode: "角度模式",
            angleModeDesc: "發射角度的確定方式",
            angleRange: "角度範圍",
            fixedAngle: "固定角度",
            randomAngle: "隨機角度",
            centerAngle: "中心角度",
            centerAngleDesc: "煙火發射的主要方向",
            rightAngle: "45°（右）",
            upAngle: "90°（上）",
            leftAngle: "135°（左）",
            angleSpread: "角度擴散",
            angleSpreadDesc: "從中心的角度變化範圍（±擴散）",
            preciseAngle: "0°（精確）",
            wideVariety: "45°（廣泛）",
            fixedAngleLabel: "固定角度",
            fixedAngleDesc: "所有煙火的固定發射角度",
            rightFixed: "45°（右）",
            straightUp: "90°（直上）",
            leftFixed: "135°（左）",
            launchPower: "🚀 發射力度",
            launchPowerLabel: "發射力度",
            launchPowerDesc: "煙火到達的高度（10% = 螢幕高度的10%，100% = 螢幕高度的90%）",
            lowPower: "10%（低）",
            highPower: "100%（高）",
            randomLaunchPower: "隨機發射力度",
            randomLaunchPowerDesc: "每個煙火具有不同的隨機發射力度以增加變化。",
            minimumPower: "最小力度",
            minimumPowerDesc: "隨機煙火的最小發射力度。",
            veryLow: "10%（極低）",
            high: "80%（高）",
            maximumPower: "最大力度",
            maximumPowerDesc: "隨機煙火的最大發射力度。",
            lowLabel: "20%（低）",
            maximum: "100%（最大）",
            quickPresets: "⚡ 快速預設",
            launchPattern: "發射模式",
            selectPreset: "-- 選擇預設 --",
            presetDescription: "選擇預設以快速配置發射設定",
            fireworkAppearance: "✨ 煙火外觀",
            sizeSettings: "📏 大小設定",
            fireworkSize: "煙火大小",
            fireworkSizeDesc: "控制爆炸時煙火和上傳圖像的顯示大小。",
            randomFireworkSizes: "隨機煙火大小",
            randomFireworkSizesDesc: "每個煙火具有不同的隨機大小以增加變化。",
            smallestSize: "最小大小",
            smallestSizeDesc: "隨機煙火的最小大小。",
            largestSize: "最大大小",
            largestSizeDesc: "隨機煙火的最大大小。",
            physicsAndBehavior: "⚙️ 物理與行為",
            physicsSettings: "🌍 物理設定",
            maxFireworksOnScreen: "螢幕上最大煙火數",
            maxFireworksOnScreenDesc: "同時可以活躍的煙火最大數量。",
            gravityStrength: "重力強度",
            gravityStrengthDesc: "煙火下落的速度（高 = 快速下落）。",
            smokeTrail: "煙霧軌跡",
            smokeTrailDesc: "上升煙火後面煙霧軌跡的強度。",
            maxFireworks: "最大煙火數",
            maxFireworksDesc: "同時可以活躍的煙火最大數量。",
            launchHeight: "發射高度",
            launchHeightDesc: "煙火爆炸前上升的高度。",
            explosionSize: "爆炸大小",
            explosionSizeDesc: "煙火爆炸的大小。",
            particleCount: "粒子數量",
            particleCountDesc: "每次爆炸中的粒子數量。",
            gravity: "重力",
            gravityDesc: "爆炸後粒子下落的速度。",
            fadeRate: "消散速度",
            fadeRateDesc: "粒子消失的速度。",
            trailLength: "軌跡長度",
            trailLengthDesc: "煙火粒子後面的軌跡長度。"
        },
        bubbles: {
            title: "🫧 氣泡設定",
            launchControls: "🚀 發射控制",
            launchPosition: "🎯 發射位置",
            positionMode: "位置模式",
            positionModeDesc: "氣泡在螢幕底部的定位方式",
            centerOnly: "僅中央",
            rangeFromCenter: "從中央範圍",
            randomAcrossScreen: "螢幕隨機",
            launchSpread: "發射擴散",
            launchSpreadDesc: "發射區域的寬度（0% = 中心點，100% = 整個螢幕寬度）",
            centerOnlyLabel: "僅中央",
            fullWidthLabel: "全寬",
            clusterSettings: "🫧 集群設定",
            bubblesPerLaunch: "每次發射氣泡數",
            bubblesPerLaunchDesc: "每次發射時建立的氣泡數量",
            noneCluster: "0（無）",
            largeCluster: "8（大集群）",
            randomBubblesPerLaunch: "隨機氣泡數",
            randomBubblesPerLaunchDesc: "每次發射建立隨機數量的氣泡以增加變化。",
            minimumBubbles: "最小氣泡數",
            minimumBubblesDesc: "每次發射的最小氣泡數。",
            singleBubble: "1（單個）",
            mediumCluster: "5（中集群）",
            maximumBubbles: "最大氣泡數",
            maximumBubblesDesc: "每次發射的最大氣泡數。",
            smallCluster: "3（小集群）",
            largeClusterMax: "8（大集群）",
            clusterSpread: "集群擴散",
            clusterSpreadDesc: "每個集群內氣泡的分散程度",
            tightCluster: "5px（緊密）",
            wideCluster: "100px（寬鬆）",
            riseSpeed: "⬆️ 上升速度",
            baseRiseSpeed: "基礎上升速度",
            baseRiseSpeedDesc: "氣泡向上漂浮的基礎速度",
            slowFloat: "0.5（慢速漂浮）",
            fastRise: "5.0（快速上升）",
            randomRiseSpeeds: "隨機上升速度",
            randomRiseSpeedsDesc: "每個氣泡具有不同的隨機上升速度以增加變化。",
            minimumSpeed: "最小速度",
            minimumSpeedDesc: "隨機氣泡的最小上升速度。",
            verySlow: "0.5（極慢）",
            fastSpeed: "3.0（快速）",
            maximumSpeed: "最大速度",
            maximumSpeedDesc: "隨機氣泡的最大上升速度。",
            moderateSpeed: "2.0（中等）",
            veryFastSpeed: "5.0（極快）",
            quickPresets: "⚡ 快速預設",
            bubblePattern: "氣泡模式",
            selectPreset: "-- 選擇預設 --",
            presetDescription: "選擇預設以快速配置氣泡設定",
            bubbleAppearance: "✨ 氣泡外觀",
            sizeSettings: "📏 大小設定",
            bubbleSize: "氣泡大小",
            bubbleSizeDesc: "控制破裂時氣泡和上傳圖像的顯示大小。",
            randomBubbleSizes: "隨機氣泡大小",
            randomBubbleSizesDesc: "每個氣泡具有不同的隨機大小以增加變化。",
            smallestBubbleSize: "最小大小",
            smallestBubbleSizeDesc: "隨機氣泡的最小大小。",
            largestBubbleSize: "最大大小",
            largestBubbleSizeDesc: "隨機氣泡的最大大小。",
            popBehavior: "💥 破裂行為",
            testBubblePopHeightSettings: "🎯 測試氣泡破裂高度設定",
            testBubbleAutoPopHeight: "測試氣泡自動破裂高度",
            testBubbleAutoPopHeightDesc: "測試氣泡自動破裂的高度（10% = 天空低處，100% = 天空高處）",
            lowInSky: "10%（天空低處）",
            highInSky: "100%（天空高處）",
            randomTestBubblePopHeights: "隨機測試氣泡破裂高度",
            randomTestBubblePopHeightsDesc: "每個測試氣泡在不同隨機高度破裂以增加變化。",
            minimumPopHeight: "最小破裂高度",
            minimumPopHeightDesc: "隨機測試氣泡的最小破裂高度（低 = 接近地面）。",
            lowPop: "10%（低）",
            highPop: "80%（高）",
            maximumPopHeight: "最大破裂高度",
            maximumPopHeightDesc: "隨機測試氣泡的最大破裂高度（高 = 接近頂部）。",
            moderatePop: "30%（中等）",
            veryHighPop: "100%（極高）",
            popSettings: "⚙️ 破裂設定",
            maxBubblesOnScreen: "螢幕上最大氣泡數",
            maxBubblesOnScreenDesc: "同時可以活躍的氣泡最大數量。",
            physicsAndBehavior: "⚙️ 物理與行為",
            physicsSettings: "🌍 物理設定",
            bubbleGravity: "氣泡重力",
            bubbleGravityDesc: "重力對氣泡的影響（高 = 下落更快）。",
            wobbleIntensity: "擺動強度",
            wobbleIntensityDesc: "氣泡漂浮時的擺動程度（0 = 直上）。",
            buoyancy: "浮力",
            buoyancyDesc: "氣泡抵抗重力的能力（高 = 更好地漂浮）。",
            maxBubbles: "最大氣泡數",
            maxBubblesDesc: "同時可以活躍的氣泡最大數量。",
            riseSpeed: "上升速度",
            riseSpeedDesc: "氣泡在螢幕上上升的速度。",
            popIntensity: "爆破強度",
            popIntensityDesc: "氣泡爆破動畫的強度。",
            transparency: "透明度",
            transparencyDesc: "氣泡的透明程度。",
            wobble: "擺動效果",
            wobbleDesc: "氣泡上升時的擺動程度。"
        },
        effects: {
            title: "✨ 視覺效果設定",
            animationSpeed: "動畫速度",
            animationSpeedDesc: "所有動畫的整體速度（高=更快，低=較慢）。",
            explosionParticles: "爆炸粒子",
            explosionParticlesDesc: "煙火爆炸時創建的閃亮粒子數量。",
            particleDuration: "粒子持續時間",
            particleDurationDesc: "爆炸粒子在消失前保持可見的時間。",
            smallestParticles: "最小粒子",
            smallestParticlesDesc: "單個爆炸粒子的最小大小。",
            largestParticles: "最大粒子",
            largestParticlesDesc: "單個爆炸粒子的最大大小。",
            colorfulParticles: "彩色粒子",
            colorfulParticlesDesc: "為粒子使用多種顏色，而不是單色爆炸。",
            glowEffect: "發光效果",
            glowEffectDesc: "在煙火和粒子周圍添加美麗的發光光環。",
            particleFadeSpeed: "粒子消散速度",
            particleFadeSpeedDesc: "粒子消失的速度（高=更慢消散，持續更久）。",
            screenShake: "螢幕震動",
            screenShakeDesc: "在激烈動畫期間啟用螢幕震動效果。",
            particleTrails: "粒子軌跡",
            particleTrailsDesc: "啟用粒子後面的軌跡效果。"
        },
        images: {
            title: "🖼️ 圖像設定",
            autoRemoveBackgrounds: "自動移除背景",
            autoRemoveBackgroundsDesc: "自動從上傳的煙火圖像中移除白色/單色背景。",
            spinningImages: "旋轉圖像",
            spinningImagesDesc: "在煙火爆炸期間讓上傳的圖像旋轉。",
            imageGravity: "圖像重力",
            imageGravityDesc: "爆炸後圖像下落的速度（0=永遠浮動，高=快速下落）。",
            backgroundImageOpacity: "背景圖像不透明度",
            backgroundImageOpacityDesc: "背景幻燈片圖像的透明程度（0=不可見，1=實心）。",
            backgroundTransition: "背景切換",
            backgroundTransitionDesc: "背景圖像從一個淡入下一個所需的時間。",
            backgroundDuration: "背景持續時間",
            backgroundDurationDesc: "每個背景圖像在切換到下一個之前顯示的時間。",
            customImages: "自訂圖像",
            customImagesDesc: "在動畫中使用上傳的自訂圖像。"
        },
        colors: {
            title: "🎨 顏色和主題",
            colorTheme: "顏色主題",
            colorThemeDesc: "為煙火和粒子選擇顏色風格。",
            vivid: "🌈 鮮豔（明亮大膽）",
            pastel: "🌸 柔和（柔軟溫和）",
            neon: "⚡ 霓虹（電光發光）",
            earthy: "🍂 樸實（自然溫暖）",
            monochrome: "⚫ 單色（黑白）",
            custom: "🎨 自訂（您的顏色）",
            colorIntensity: "顏色強度",
            colorIntensityDesc: "調整顏色的整體鮮豔程度。",
            customColors: "自訂顏色",
            addColor: "新增顏色",
            customColorsDesc: "點擊色塊刪除。",
            noCustomColors: "尚未新增自訂顏色",
            colorAdded: "已將{{color}}新增到調色盤",
            colorRemoved: "已從調色盤移除{{color}}",
            colorAlreadyExists: "顏色{{color}}已在調色盤中"
        },
        actions: {
            resetAll: "重置所有設定",
            resetAllDesc: "將所有設定重置為預設值。",
            exportSettings: "匯出設定",
            importSettings: "匯入設定"
        }
    },

    // Preset System
    presets: {
        title: "動畫預設",
        names: {
            classic: "🎆 經典",
            wideCelebration: "🎉 寬慶祝",
            fountain: "⛲ 噴泉",
            rocketStraight: "🚀 直線火箭",
            leftCascade: "↖️ 左瀑布",
            rightCascade: "↗️ 右瀑布",
            chaos: "🌪️ 混亂模式",
            gentle: "🌸 溫和微風",
            intense: "⚡ 強烈風暴",
            rainbow: "🌈 彩虹爆發",
            celebration: "🎉 慶祝（大集群，快速上升）",
            fountainBubbles: "⛲ 噴泉（中心，多氣泡）",
            stream: "🌊 溪流（單線，穩定）",
            chaosBubbles: "🌪️ 混亂模式（隨機一切）",
            peaceful: "🕊️ 寧靜（緩慢，分散）",
            party: "🎊 派對（快速，到處）"
        },
        descriptions: {
            classic: "傳統中央發射，輕微擴散和適度角度",
            wideCelebration: "具有廣泛角度變化的全螢幕煙火",
            fountain: "像水噴泉一樣的連續向上流動",
            rocketStraight: "最小擴散的直線垂直火箭",
            leftCascade: "向左流動的美麗瀑布效果",
            rightCascade: "向右流動的美麗瀑布效果",
            chaos: "整個螢幕上的隨機混亂爆炸"
        },
        actions: {
            load: "載入預設",
            preview: "預覽",
            save: "儲存預設",
            delete: "刪除預設",
            discover: "🔍 發現預設",
            loadFolder: "📁 載入預設資料夾",
            clearAll: "清除全部"
        },
        messages: {
            loaded: "預設'{{name}}'載入成功",
            saved: "預設已儲存為'{{name}}'",
            deleted: "預設'{{name}}'已刪除",
            cleared: "所有預設已清除",
            discovering: "正在發現可用預設...",
            noPresets: "未載入預設",
            discoverInstructions: "點擊「發現預設」掃描您的/presets/資料夾並查找可用的預設集合。",
            loadError: "載入預設失敗",
            saveError: "儲存預設失敗"
        },
        sections: {
            discovered: "📦 發現的預設",
            loaded: "📁 已載入的預設"
        }
    },

    // Upload System
    upload: {
        instructions: {
            dragDrop: "將自訂圖像拖放到此處",
            or: "或",
            selectFiles: "選擇檔案",
            selectBgFiles: "選擇背景檔案",
            fileTypes: "支援：JPG、PNG、GIF（每個最大5MB）",
            imageDescription: "圖像將在煙火爆炸和氣泡破裂時顯示",
            backgroundDescription: "背景圖像將顯示在動畫後面"
        },
        buttons: {
            selectFiles: "選擇檔案",
            selectBackground: "選擇背景",
            removeAll: "移除全部",
            preview: "預覽圖像"
        },
        messages: {
            uploading: "正在上傳{{current}}/{{total}}檔案...",
            success: "{{count}}個檔案上傳成功",
            error: "{{filename}}上傳失敗",
            invalidType: "{{filename}}不是支援的圖像類型",
            tooLarge: "{{filename}}太大（最大5MB）",
            duplicate: "{{filename}}已存在",
            removed: "{{filename}}已移除",
            cleared: "所有圖像已清除"
        },
        errors: {
            noFiles: "未選擇檔案",
            uploadFailed: "上傳失敗",
            invalidFormat: "無效檔案格式",
            fileTooLarge: "檔案大小超過5MB限制",
            networkError: "上傳期間網路錯誤",
            serverError: "上傳期間伺服器錯誤"
        }
    },

    // Error Messages
    errors: {
        microphone: {
            denied: "麥克風存取被拒絕",
            failed: "麥克風初始化失敗",
            unsupported: "不支援麥克風",
            busy: "麥克風忙碌"
        },
        files: {
            tooLarge: "檔案太大",
            invalidType: "無效檔案類型",
            uploadFailed: "上傳失敗",
            notFound: "檔案未找到",
            corrupted: "檔案似乎已損壞"
        },
        network: {
            offline: "無網路連接",
            timeout: "請求超時",
            serverError: "伺服器錯誤",
            forbidden: "存取被禁止"
        },
        browser: {
            compatibility: "瀏覽器相容性警告",
            unsupportedFeatures: "您的瀏覽器不支援以下功能：",
            modernBrowser: "請嘗試使用Chrome、Firefox、Safari或Edge等現代瀏覽器。"
        },
        generic: {
            unknown: "發生未知錯誤",
            tryAgain: "請重試",
            contact: "如果問題持續存在，請聯絡支援"
        }
    },

    // Success Messages
    success: {
        settings: {
            saved: "設定儲存成功",
            reset: "設定已重置為預設值",
            imported: "設定匯入成功",
            exported: "設定匯出成功"
        },
        files: {
            uploaded: "檔案上傳成功",
            removed: "檔案移除成功",
            cleared: "所有檔案已清除"
        },
        audio: {
            started: "音訊檢測已開始",
            stopped: "音訊檢測已停止",
            calibrated: "麥克風校準成功"
        }
    },

    // Navigation and General UI
    navigation: {
        home: "主頁",
        settings: "設定",
        presets: "預設",
        upload: "上傳",
        about: "關於",
        help: "說明"
    },

    // Time and Date
    time: {
        now: "現在",
        today: "今天",
        yesterday: "昨天",
        minutes: "{{count}}分鐘前",
        hours: "{{count}}小時前",
        days: "{{count}}天前"
    },

    // Accessibility
    accessibility: {
        startButton: "開始動畫",
        stopButton: "停止動畫",
        settingsButton: "開啟設定面板",
        closeButton: "關閉面板",
        volumeSlider: "調整音量敏感度",
        languageSelector: "選擇介面語言",
        fileUpload: "上傳圖像檔案",
        presetSelector: "選擇動畫預設"
    },

    // Help and Instructions
    help: {
        title: "使用方法",
        gettingStarted: "入門",
        audioSetup: "音訊設定",
        customization: "自訂",
        troubleshooting: "故障排除",
        instructions: {
            step1: "1. 點擊「開始」開始音訊檢測",
            step2: "2. 發出大聲持續聲音觸發動畫",
            step3: "3. 使用設定自訂體驗",
            step4: "4. 上傳自訂圖像實現個人化效果"
        }
    },

    // About Information
    about: {
        title: "Vibecoding 煙火應用",
        description: "互動式音訊反應動畫體驗",
        version: "版本 {{version}}",
        credits: "以對視覺藝術和技術的熱情創作",
        opensource: "開源專案",
        github: "在GitHub上查看"
    }
};

export default translations; 