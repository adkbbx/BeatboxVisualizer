/**
 * 🇨🇳 Chinese Simplified Translations - Vibecoding Fireworks App
 * 
 * Chinese Simplified translation file for all user-facing text content.
 * Core UI translations completed to match English template.
 */

export const translations = {
    // UI Controls and Navigation
    ui: {
        buttons: {
            start: "开始",
            stop: "停止",
            test: "测试",
            settings: "设置",
            hide: "隐藏",
            show: "显示",
            close: "关闭设置",
            reset: "重置",
            load: "加载",
            preview: "预览",
            discover: "发现",
            clearAll: "清除全部",
            selectFiles: "选择文件",
            ok: "确定",
            cancel: "取消"
        },
        modes: {
            fireworks: "烟花",
            bubbles: "气泡"
        },
        tabs: {
            animationImages: "动画图像",
            backgroundImages: "背景图像",
            presets: "预设"
        },
        status: {
            starting: "启动中...",
            stopping: "停止中...",
            loading: "加载中...",
            discovering: "搜索中...",
            clearing: "清除中...",
            testing: "测试中...",
            uploading: "上传中...",
            processing: "处理中..."
        },
        language: {
            selector: "语言",
            english: "English",
            japanese: "日本語",
            chineseSimplified: "简体中文",
            chineseTraditional: "繁體中文"
        }
    },

    // Audio System
    audio: {
        status: {
            active: "音频状态：活跃",
            inactive: "音频状态：非活跃",
            starting: "音频状态：启动中...",
            stopping: "音频状态：停止中...",
            error: "音频状态：错误",
            failed: "音频状态：启动失败",
            denied: "麦克风访问被拒绝",
            unsupported: "此浏览器不支持音频"
        },
        instructions: {
            main: "发出更大声、持续的声音来启动动画。持续发声让它们继续上升。非常大的声音将触发所有活跃的动画！🔊",
            detection: "发出更大声、持续的声音来开始动画",
            inactive: "麦克风非活跃 - 未检测到声音",
            tapToStart: "点击麦克风按钮开始音频检测"
        },
        errors: {
            permissionDenied: "麦克风权限被拒绝。请在浏览器设置中启用麦克风访问。",
            deviceNotFound: "未找到麦克风设备。",
            deviceBusy: "麦克风正被其他应用程序使用。",
            generic: "无法访问麦克风。请检查您的设备设置。"
        },
        title: "🎤 音频和声音设置",
        microphoneSensitivity: "麦克风灵敏度",
        microphoneSensitivityDesc: "麦克风对声音和音频的灵敏度。",
        launchSensitivity: "启动灵敏度",
        launchSensitivityDesc: "启动烟花所需的声音大小。",
        burstSensitivity: "爆发灵敏度",
        burstSensitivityDesc: "一次爆发所有气泡所需的音量大小。",
        quickResponse: "快速响应",
        quickResponseDesc: "应用程序对突然声音的响应速度。",
        testSounds: "测试动画声音",
        testSoundsDesc: "测试动画（烟花/气泡）时播放真实的发射和爆炸声音。",
        soundVolume: "声音音量",
        soundVolumeDesc: "动画音效的音量级别。",
        volumeThreshold: "音量阈值",
        volumeThresholdDesc: "触发动画所需的最小音量级别。"
    },

    // Settings Panel
    settings: {
        title: "动画设置",
        tabs: {
            audio: "🎤 音频",
            fireworks: "🎆 烟花",
            bubbles: "🫧 气泡",
            effects: "✨ 效果",
            images: "🖼️ 图像",
            colors: "🎨 颜色"
        },
        audio: {
            title: "🎤 音频和声音设置",
            microphoneSensitivity: "麦克风灵敏度",
            microphoneSensitivityDesc: "麦克风对声音和音频的灵敏度。",
            launchSensitivity: "启动灵敏度",
            launchSensitivityDesc: "启动烟花所需的声音大小。",
            burstSensitivity: "爆发灵敏度",
            burstSensitivityDesc: "一次爆发所有气泡所需的音量大小。",
            quickResponse: "快速响应",
            quickResponseDesc: "应用程序对突然声音的响应速度。",
            testSounds: "测试动画声音",
            testSoundsDesc: "测试动画（烟花/气泡）时播放真实的发射和爆炸声音。",
            soundVolume: "声音音量",
            soundVolumeDesc: "动画音效的音量级别。",
            volumeThreshold: "音量阈值",
            volumeThresholdDesc: "触发动画所需的最小音量级别。"
        },
        fireworks: {
            title: "🎆 烟花设置",
            launchControls: "🚀 发射控制",
            launchPosition: "🎯 发射位置",
            positionMode: "位置模式",
            positionModeDesc: "烟花在屏幕底部的定位方式",
            centerOnly: "仅中央",
            rangeFromCenter: "从中央范围",
            randomAcrossScreen: "屏幕随机",
            launchSpread: "发射扩散",
            launchSpreadDesc: "发射区域的宽度（0% = 中心点，100% = 整个屏幕宽度）",
            centerOnlyLabel: "仅中央",
            fullWidthLabel: "全宽",
            launchAngle: "📐 发射角度",
            angleMode: "角度模式",
            angleModeDesc: "发射角度的确定方式",
            angleRange: "角度范围",
            fixedAngle: "固定角度",
            randomAngle: "随机角度",
            centerAngle: "中心角度",
            centerAngleDesc: "烟花发射的主要方向",
            rightAngle: "45°（右）",
            upAngle: "90°（上）",
            leftAngle: "135°（左）",
            angleSpread: "角度扩散",
            angleSpreadDesc: "从中心的角度变化范围（±扩散）",
            preciseAngle: "0°（精确）",
            wideVariety: "45°（广泛）",
            fixedAngleLabel: "固定角度",
            fixedAngleDesc: "所有烟花的固定发射角度",
            rightFixed: "45°（右）",
            straightUp: "90°（直上）",
            leftFixed: "135°（左）",
            launchPower: "🚀 发射力度",
            launchPowerLabel: "发射力度",
            launchPowerDesc: "烟花到达的高度（10% = 屏幕高度的10%，100% = 屏幕高度的90%）",
            lowPower: "10%（低）",
            highPower: "100%（高）",
            randomLaunchPower: "随机发射力度",
            randomLaunchPowerDesc: "每个烟花具有不同的随机发射力度以增加变化。",
            minimumPower: "最小力度",
            minimumPowerDesc: "随机烟花的最小发射力度。",
            veryLow: "10%（极低）",
            high: "80%（高）",
            maximumPower: "最大力度",
            maximumPowerDesc: "随机烟花的最大发射力度。",
            lowLabel: "20%（低）",
            maximum: "100%（最大）",
            quickPresets: "⚡ 快速预设",
            launchPattern: "发射模式",
            selectPreset: "-- 选择预设 --",
            presetDescription: "选择预设以快速配置发射设置",
            fireworkAppearance: "✨ 烟花外观",
            sizeSettings: "📏 大小设置",
            fireworkSize: "烟花大小",
            fireworkSizeDesc: "控制爆炸时烟花和上传图像的显示大小。",
            randomFireworkSizes: "随机烟花大小",
            randomFireworkSizesDesc: "每个烟花具有不同的随机大小以增加变化。",
            smallestSize: "最小大小",
            smallestSizeDesc: "随机烟花的最小大小。",
            largestSize: "最大大小",
            largestSizeDesc: "随机烟花的最大大小。",
            physicsAndBehavior: "⚙️ 物理与行为",
            physicsSettings: "🌍 物理设置",
            maxFireworksOnScreen: "屏幕上最大烟花数",
            maxFireworksOnScreenDesc: "同时可以活跃的烟花最大数量。",
            gravityStrength: "重力强度",
            gravityStrengthDesc: "烟花下落的速度（高 = 快速下落）。",
            smokeTrail: "烟雾轨迹",
            smokeTrailDesc: "上升烟花后面烟雾轨迹的强度。",
            maxFireworks: "最大烟花数",
            maxFireworksDesc: "同时可以活跃的烟花最大数量。",
            launchHeight: "发射高度",
            launchHeightDesc: "烟花爆炸前上升的高度。",
            explosionSize: "爆炸大小",
            explosionSizeDesc: "烟花爆炸的大小。",
            particleCount: "粒子数量",
            particleCountDesc: "每次爆炸中的粒子数量。",
            gravity: "重力",
            gravityDesc: "爆炸后粒子下落的速度。",
            fadeRate: "消散速度",
            fadeRateDesc: "粒子消失的速度。",
            trailLength: "轨迹长度",
            trailLengthDesc: "烟花粒子后面的轨迹长度。"
        },
        bubbles: {
            title: "🫧 泡泡设置",
            launchControls: "🚀 发射控制",
            launchPosition: "🎯 发射位置",
            positionMode: "位置模式",
            positionModeDesc: "泡泡在屏幕底部的定位方式",
            centerOnly: "仅中央",
            rangeFromCenter: "从中央范围",
            randomAcrossScreen: "屏幕随机",
            launchSpread: "发射扩散",
            launchSpreadDesc: "发射区域的宽度（0% = 中心点，100% = 整个屏幕宽度）",
            centerOnlyLabel: "仅中央",
            fullWidthLabel: "全宽",
            clusterSettings: "🫧 集群设置",
            bubblesPerLaunch: "每次发射泡泡数",
            bubblesPerLaunchDesc: "每次发射时创建的泡泡数量",
            noneCluster: "0（无）",
            largeCluster: "8（大集群）",
            randomBubblesPerLaunch: "随机泡泡数",
            randomBubblesPerLaunchDesc: "每次发射创建随机数量的泡泡以增加变化。",
            minimumBubbles: "最小泡泡数",
            minimumBubblesDesc: "每次发射的最小泡泡数。",
            singleBubble: "1（单个）",
            mediumCluster: "5（中集群）",
            maximumBubbles: "最大泡泡数",
            maximumBubblesDesc: "每次发射的最大泡泡数。",
            smallCluster: "3（小集群）",
            largeClusterMax: "8（大集群）",
            clusterSpread: "集群扩散",
            clusterSpreadDesc: "每个集群内泡泡的分散程度",
            tightCluster: "5px（紧密）",
            wideCluster: "100px（宽松）",
            riseSpeed: "⬆️ 上升速度",
            baseRiseSpeed: "基础上升速度",
            baseRiseSpeedDesc: "泡泡向上漂浮的基础速度",
            slowFloat: "0.5（慢速漂浮）",
            fastRise: "5.0（快速上升）",
            randomRiseSpeeds: "随机上升速度",
            randomRiseSpeedsDesc: "每个泡泡具有不同的随机上升速度以增加变化。",
            minimumSpeed: "最小速度",
            minimumSpeedDesc: "随机泡泡的最小上升速度。",
            verySlow: "0.5（极慢）",
            fastSpeed: "3.0（快速）",
            maximumSpeed: "最大速度",
            maximumSpeedDesc: "随机泡泡的最大上升速度。",
            moderateSpeed: "2.0（中等）",
            veryFastSpeed: "5.0（极快）",
            quickPresets: "⚡ 快速预设",
            bubblePattern: "泡泡模式",
            selectPreset: "-- 选择预设 --",
            presetDescription: "选择预设以快速配置泡泡设置",
            bubbleAppearance: "✨ 泡泡外观",
            sizeSettings: "📏 大小设置",
            bubbleSize: "泡泡大小",
            bubbleSizeDesc: "控制破裂时泡泡和上传图像的显示大小。",
            randomBubbleSizes: "随机泡泡大小",
            randomBubbleSizesDesc: "每个泡泡具有不同的随机大小以增加变化。",
            smallestBubbleSize: "最小大小",
            smallestBubbleSizeDesc: "随机泡泡的最小大小。",
            largestBubbleSize: "最大大小",
            largestBubbleSizeDesc: "随机泡泡的最大大小。",
            popBehavior: "💥 破裂行为",
            testBubblePopHeightSettings: "🎯 测试泡泡破裂高度设置",
            testBubbleAutoPopHeight: "测试泡泡自动破裂高度",
            testBubbleAutoPopHeightDesc: "测试泡泡自动破裂的高度（10% = 天空低处，100% = 天空高处）",
            lowInSky: "10%（天空低处）",
            highInSky: "100%（天空高处）",
            randomTestBubblePopHeights: "随机测试泡泡破裂高度",
            randomTestBubblePopHeightsDesc: "每个测试泡泡在不同随机高度破裂以增加变化。",
            minimumPopHeight: "最小破裂高度",
            minimumPopHeightDesc: "随机测试泡泡的最小破裂高度（低 = 接近地面）。",
            lowPop: "10%（低）",
            highPop: "80%（高）",
            maximumPopHeight: "最大破裂高度",
            maximumPopHeightDesc: "随机测试泡泡的最大破裂高度（高 = 接近顶部）。",
            moderatePop: "30%（中等）",
            veryHighPop: "100%（极高）",
            popSettings: "⚙️ 破裂设置",
            maxBubblesOnScreen: "屏幕上最大泡泡数",
            maxBubblesOnScreenDesc: "同时可以活跃的泡泡最大数量。",
            physicsAndBehavior: "⚙️ 物理与行为",
            physicsSettings: "🌍 物理设置",
            bubbleGravity: "泡泡重力",
            bubbleGravityDesc: "重力对泡泡的影响（高 = 下落更快）。",
            wobbleIntensity: "摆动强度",
            wobbleIntensityDesc: "泡泡漂浮时的摆动程度（0 = 直上）。",
            buoyancy: "浮力",
            buoyancyDesc: "泡泡抵抗重力的能力（高 = 更好地漂浮）。",
            maxBubbles: "最大泡泡数",
            maxBubblesDesc: "同时可以活跃的泡泡最大数量。",
            riseSpeed: "上升速度",
            riseSpeedDesc: "泡泡在屏幕上上升的速度。",
            popIntensity: "破裂强度",
            popIntensityDesc: "泡泡破裂动画的强度。",
            transparency: "透明度",
            transparencyDesc: "泡泡的透明程度。",
            wobble: "摆动效果",
            wobbleDesc: "泡泡上升时的摆动程度。"
        },
        effects: {
            title: "✨ 视觉效果设置",
            animationSpeed: "动画速度",
            animationSpeedDesc: "所有动画的整体速度（高=更快，低=较慢）。",
            explosionParticles: "爆炸粒子",
            explosionParticlesDesc: "烟花爆炸时创建的闪亮粒子数量。",
            particleDuration: "粒子持续时间",
            particleDurationDesc: "爆炸粒子在消失前保持可见的时间。",
            smallestParticles: "最小粒子",
            smallestParticlesDesc: "单个爆炸粒子的最小大小。",
            largestParticles: "最大粒子",
            largestParticlesDesc: "单个爆炸粒子的最大大小。",
            colorfulParticles: "彩色粒子",
            colorfulParticlesDesc: "为粒子使用多种颜色，而不是单色爆炸。",
            glowEffect: "发光效果",
            glowEffectDesc: "在烟花和粒子周围添加美丽的发光光环。",
            particleFadeSpeed: "粒子消散速度",
            particleFadeSpeedDesc: "粒子消失的速度（高=更慢消散，持续更久）。",
            screenShake: "屏幕震动",
            screenShakeDesc: "在激烈动画期间启用屏幕震动效果。",
            particleTrails: "粒子轨迹",
            particleTrailsDesc: "启用粒子后面的轨迹效果。"
        },
        images: {
            title: "🖼️ 图像设置",
            autoRemoveBackgrounds: "自动移除背景",
            autoRemoveBackgroundsDesc: "自动从上传的烟花图像中移除白色/单色背景。",
            spinningImages: "旋转图像",
            spinningImagesDesc: "在烟花爆炸期间让上传的图像旋转。",
            imageGravity: "图像重力",
            imageGravityDesc: "爆炸后图像下落的速度（0=永远浮动，高=快速下落）。",
            backgroundImageOpacity: "背景图像不透明度",
            backgroundImageOpacityDesc: "背景幻灯片图像的透明程度（0=不可见，1=实心）。",
            backgroundTransition: "背景切换",
            backgroundTransitionDesc: "背景图像从一个淡入下一个所需的时间。",
            backgroundDuration: "背景持续时间",
            backgroundDurationDesc: "每个背景图像在切换到下一个之前显示的时间。",
            customImages: "自定义图像",
            customImagesDesc: "在动画中使用上传的自定义图像。"
        },
        colors: {
            title: "🎨 颜色和主题",
            colorTheme: "颜色主题",
            colorThemeDesc: "为烟花和粒子选择颜色风格。",
            vivid: "🌈 鲜艳（明亮大胆）",
            pastel: "🌸 柔和（柔软温和）",
            neon: "⚡ 霓虹（电光发光）",
            earthy: "🍂 朴实（自然温暖）",
            monochrome: "⚫ 单色（黑白）",
            custom: "🎨 自定义（您的颜色）",
            colorIntensity: "颜色强度",
            colorIntensityDesc: "调整颜色的整体鲜艳程度。",
            customColors: "自定义颜色",
            addColor: "添加颜色",
            customColorsDesc: "点击色块删除。",
            noCustomColors: "尚未添加自定义颜色",
            colorAdded: "已将{{color}}添加到调色板",
            colorRemoved: "已从调色板移除{{color}}",
            colorAlreadyExists: "颜色{{color}}已在调色板中"
        },
        actions: {
            resetAll: "重置所有设置",
            resetAllDesc: "将所有设置重置为默认值。",
            exportSettings: "导出设置",
            importSettings: "导入设置"
        }
    },

    // Preset System
    presets: {
        title: "动画预设",
        names: {
            classic: "🎆 经典",
            wideCelebration: "🎉 宽庆祝",
            fountain: "⛲ 喷泉",
            rocketStraight: "🚀 直线火箭",
            leftCascade: "↖️ 左瀑布",
            rightCascade: "↗️ 右瀑布",
            chaos: "🌪️ 混乱模式",
            gentle: "🌸 温和微风",
            intense: "⚡ 强烈风暴",
            rainbow: "🌈 彩虹爆发",
            celebration: "🎉 庆祝（大集群，快速上升）",
            fountainBubbles: "⛲ 喷泉（中心，多气泡）",
            stream: "🌊 溪流（单线，稳定）",
            chaosBubbles: "🌪️ 混乱模式（随机一切）",
            peaceful: "🕊️ 宁静（缓慢，分散）",
            party: "🎊 派对（快速，到处）"
        },
        descriptions: {
            classic: "传统中央发射，轻微扩散和适度角度",
            wideCelebration: "具有广泛角度变化的全屏烟花",
            fountain: "像水喷泉一样的连续向上流动",
            rocketStraight: "最小扩散的直线垂直火箭",
            leftCascade: "向左流动的美丽瀑布效果",
            rightCascade: "向右流动的美丽瀑布效果",
            chaos: "整个屏幕上的随机混乱爆炸"
        },
        actions: {
            load: "加载预设",
            preview: "预览",
            save: "保存预设",
            delete: "删除预设",
            discover: "🔍 发现预设",
            loadFolder: "📁 加载预设文件夹",
            clearAll: "🗑️ 清除全部"
        },
        messages: {
            loaded: "预设'{{name}}'加载成功",
            saved: "预设已保存为'{{name}}'",
            deleted: "预设'{{name}}'已删除",
            cleared: "所有预设已清除",
            discovering: "正在发现可用预设...",
            noPresets: "未加载预设",
            discoverInstructions: "点击「发现预设」扫描您的/presets/文件夹并查找可用的预设集合。",
            loadError: "加载预设失败",
            saveError: "保存预设失败"
        },
        sections: {
            discovered: "📦 发现的预设",
            loaded: "📁 已加载的预设"
        }
    },

    // Upload System
    upload: {
        instructions: {
            dragDrop: "将自定义图像拖放到此处",
            or: "或",
            selectFiles: "选择文件",
            selectBgFiles: "选择背景文件",
            fileTypes: "支持：JPG、PNG、GIF（每个最大5MB）",
            imageDescription: "图像将在烟花爆炸和气泡破裂时显示",
            backgroundDescription: "背景图像将显示在动画后面"
        },
        buttons: {
            selectFiles: "选择文件",
            selectBackground: "选择背景",
            removeAll: "移除全部",
            preview: "预览图像"
        },
        messages: {
            uploading: "正在上传{{current}}/{{total}}文件...",
            success: "{{count}}个文件上传成功",
            error: "{{filename}}上传失败",
            invalidType: "{{filename}}不是支持的图像类型",
            tooLarge: "{{filename}}太大（最大5MB）",
            duplicate: "{{filename}}已存在",
            removed: "{{filename}}已移除",
            cleared: "所有图像已清除"
        },
        errors: {
            noFiles: "未选择文件",
            uploadFailed: "上传失败",
            invalidFormat: "无效文件格式",
            fileTooLarge: "文件大小超过5MB限制",
            networkError: "上传期间网络错误",
            serverError: "上传期间服务器错误"
        }
    },

    // Error Messages
    errors: {
        microphone: {
            denied: "麦克风访问被拒绝",
            failed: "麦克风初始化失败",
            unsupported: "不支持麦克风",
            busy: "麦克风忙碌"
        },
        files: {
            tooLarge: "文件太大",
            invalidType: "无效文件类型",
            uploadFailed: "上传失败",
            notFound: "文件未找到",
            corrupted: "文件似乎已损坏"
        },
        network: {
            offline: "无网络连接",
            timeout: "请求超时",
            serverError: "服务器错误",
            forbidden: "访问被禁止"
        },
        browser: {
            compatibility: "浏览器兼容性警告",
            unsupportedFeatures: "您的浏览器不支持以下功能：",
            modernBrowser: "请尝试使用Chrome、Firefox、Safari或Edge等现代浏览器。"
        },
        generic: {
            unknown: "发生未知错误",
            tryAgain: "请重试",
            contact: "如果问题持续存在，请联系支持"
        }
    },

    // Success Messages
    success: {
        settings: {
            saved: "设置保存成功",
            reset: "设置已重置为默认值",
            imported: "设置导入成功",
            exported: "设置导出成功"
        },
        files: {
            uploaded: "文件上传成功",
            removed: "文件移除成功",
            cleared: "所有文件已清除"
        },
        audio: {
            started: "音频检测已开始",
            stopped: "音频检测已停止",
            calibrated: "麦克风校准成功"
        }
    },

    // Navigation and General UI
    navigation: {
        home: "主页",
        settings: "设置",
        presets: "预设",
        upload: "上传",
        about: "关于",
        help: "帮助"
    },

    // Time and Date
    time: {
        now: "现在",
        today: "今天",
        yesterday: "昨天",
        minutes: "{{count}}分钟前",
        hours: "{{count}}小时前",
        days: "{{count}}天前"
    },

    // Accessibility
    accessibility: {
        startButton: "开始动画",
        stopButton: "停止动画",
        settingsButton: "打开设置面板",
        closeButton: "关闭面板",
        volumeSlider: "调整音量敏感度",
        languageSelector: "选择界面语言",
        fileUpload: "上传图像文件",
        presetSelector: "选择动画预设"
    },

    // Help and Instructions
    help: {
        title: "使用方法",
        gettingStarted: "入门",
        audioSetup: "音频设置",
        customization: "自定义",
        troubleshooting: "故障排除",
        instructions: {
            step1: "1. 点击「开始」开始音频检测",
            step2: "2. 发出大声持续声音触发动画",
            step3: "3. 使用设置自定义体验",
            step4: "4. 上传自定义图像实现个性化效果"
        }
    },

    // About Information
    about: {
        title: "Vibecoding 烟花应用",
        description: "交互式音频反应动画体验",
        version: "版本 {{version}}",
        credits: "以对视觉艺术和技术的热情创作",
        opensource: "开源项目",
        github: "在GitHub上查看"
    }
};

export default translations; 