/**
 * 🇯🇵 Japanese Translations - Vibecoding Fireworks App
 * 
 * Japanese translation file for all user-facing text content.
 * Core UI translations completed to match English template.
 */

export const translations = {
    // UI Controls and Navigation
    ui: {
        buttons: {
            start: "開始",
            stop: "停止",
            test: "テスト",
            settings: "設定",
            hide: "非表示",
            show: "表示",
            close: "設定を閉じる",
            reset: "リセット",
            load: "読み込み",
            preview: "プレビュー",
            discover: "発見",
            clearAll: "すべてクリア",
            selectFiles: "ファイル選択",
            ok: "OK",
            cancel: "キャンセル"
        },
        modes: {
            fireworks: "花火",
            bubbles: "バブル"
        },
        tabs: {
            animationImages: "アニメーション画像",
            background: "背景",
            presets: "プリセット"
        },
        status: {
            starting: "開始中...",
            stopping: "停止中...",
            loading: "読み込み中...",
            discovering: "検索中...",
            clearing: "クリア中...",
            testing: "テスト中...",
            uploading: "アップロード中...",
            processing: "処理中..."
        },
        language: {
            selector: "言語",
            english: "English",
            japanese: "日本語",
            chineseSimplified: "简体中文",
            chineseTraditional: "繁體中文"
        }
    },

    // Audio System
    audio: {
        status: {
            active: "オーディオ状態: アクティブ",
            inactive: "オーディオ状態: 非アクティブ",
            starting: "オーディオ状態: 開始中...",
            stopping: "オーディオ状態: 停止中...",
            error: "オーディオ状態: エラー",
            failed: "オーディオ状態: 開始失敗",
            denied: "マイクアクセスが拒否されました",
            unsupported: "このブラウザではオーディオがサポートされていません"
        },
        instructions: {
            main: "大きな持続音を出してアニメーションを開始しましょう。音を出し続けることで上昇し続けます。非常に大きな音はすべてのアクティブなアニメーションをトリガーします！🔊",
            detection: "大きな持続音を出してアニメーションを開始してください",
            inactive: "マイク非アクティブ - 音が検出されません",
            tapToStart: "マイクボタンをタップして音声検出を開始"
        },
        errors: {
            permissionDenied: "マイクの許可が拒否されました。ブラウザの設定でマイクアクセスを有効にしてください。",
            deviceNotFound: "マイクデバイスが見つかりません。",
            deviceBusy: "マイクが他のアプリケーションで使用されています。",
            generic: "マイクにアクセスできません。デバイス設定を確認してください。"
        },
        title: "🎤 オーディオ・サウンド設定",
        microphoneSensitivity: "マイク感度",
        microphoneSensitivityDesc: "マイクの音声と音への感度。",
        launchSensitivity: "起動感度",
        launchSensitivityDesc: "花火を起動するために必要な声の静かさ。",
        burstSensitivity: "バースト感度",
        burstSensitivityDesc: "すべてのバブルを一度に爆発させるために必要な音量。",
        quickResponse: "クイックレスポンス",
        quickResponseDesc: "アプリが突然の音にどれだけ速く反応するか。",
        testSounds: "テストアニメーション音",
        testSoundsDesc: "アニメーション（花火/バブル）をテストするときにリアルな起動と爆発音を再生する。",
        soundVolume: "音量",
        soundVolumeDesc: "アニメーション効果音の音量レベル。",
        volumeThreshold: "音量しきい値",
        volumeThresholdDesc: "アニメーションをトリガーするために必要な最小音量レベル。"
    },

    // Settings Panel
    settings: {
        title: "アニメーション設定",
        tabs: {
            audio: "🎤 オーディオ",
            fireworks: "🎆 花火",
            bubbles: "🫧 バブル",
            effects: "✨ エフェクト",
            images: "🖼️ 画像",
            colors: "🎨 色"
        },
        audio: {
            title: "🎤 オーディオ・サウンド設定",
            microphoneSensitivity: "マイク感度",
            microphoneSensitivityDesc: "マイクの音声と音への感度。",
            launchSensitivity: "起動感度",
            launchSensitivityDesc: "花火を起動するために必要な声の静かさ。",
            burstSensitivity: "バースト感度",
            burstSensitivityDesc: "すべてのバブルを一度に爆発させるために必要な音量。",
            quickResponse: "クイックレスポンス",
            quickResponseDesc: "アプリが突然の音にどれだけ速く反応するか。",
            testSounds: "テストアニメーション音",
            testSoundsDesc: "アニメーション（花火/バブル）をテストするときにリアルな起動と爆発音を再生する。",
            soundVolume: "音量",
            soundVolumeDesc: "アニメーション効果音の音量レベル。",
            volumeThreshold: "音量しきい値",
            volumeThresholdDesc: "アニメーションをトリガーするために必要な最小音量レベル。"
        },
        fireworks: {
            title: "🎆 花火設定",
            launchControls: "🚀 打ち上げ制御",
            launchPosition: "🎯 打ち上げ位置",
            positionMode: "位置モード",
            positionModeDesc: "画面下部での花火の配置方法",
            centerOnly: "中央のみ",
            rangeFromCenter: "中央からの範囲",
            randomAcrossScreen: "画面全体にランダム",
            launchSpread: "打ち上げ広がり",
            launchSpreadDesc: "打ち上げゾーンの幅（0% = 中心点、100% = 画面全幅）",
            centerOnlyLabel: "中央のみ",
            fullWidthLabel: "全幅",
            launchAngle: "📐 打ち上げ角度",
            angleMode: "角度モード",
            angleModeDesc: "打ち上げ角度の決定方法",
            angleRange: "角度範囲",
            fixedAngle: "固定角度",
            randomAngle: "ランダム角度",
            centerAngle: "中央角度",
            centerAngleDesc: "花火が打ち上がる主要方向",
            rightAngle: "45°（右）",
            upAngle: "90°（上）",
            leftAngle: "135°（左）",
            angleSpread: "角度拡散",
            angleSpreadDesc: "中央からの角度変動範囲（±拡散）",
            preciseAngle: "0°（精密）",
            wideVariety: "45°（広範囲）",
            fixedAngleLabel: "固定角度",
            fixedAngleDesc: "すべての花火の固定打ち上げ角度",
            rightFixed: "45°（右）",
            straightUp: "90°（真上）",
            leftFixed: "135°（左）",
            launchPower: "🚀 打ち上げ力",
            launchPowerLabel: "打ち上げ力",
            launchPowerDesc: "花火の到達高度（10% = 画面高の10%、100% = 画面高の90%）",
            lowPower: "10%（低）",
            highPower: "100%（高）",
            randomLaunchPower: "ランダム打ち上げ力",
            randomLaunchPowerDesc: "各花火がバラエティのために異なるランダム打ち上げ力を持つ。",
            minimumPower: "最小力",
            minimumPowerDesc: "ランダム花火の最小打ち上げ力。",
            veryLow: "10%（超低）",
            high: "80%（高）",
            maximumPower: "最大力",
            maximumPowerDesc: "ランダム花火の最大打ち上げ力。",
            lowLabel: "20%（低）",
            maximum: "100%（最大）",
            quickPresets: "⚡ クイックプリセット",
            launchPattern: "打ち上げパターン",
            selectPreset: "-- プリセット選択 --",
            presetDescription: "打ち上げ設定を素早く構成するプリセットを選択",
            fireworkAppearance: "✨ 花火外観",
            sizeSettings: "📏 サイズ設定",
            fireworkSize: "花火サイズ",
            fireworkSizeDesc: "爆発時の花火とアップロード画像の表示サイズを制御。",
            randomFireworkSizes: "ランダム花火サイズ",
            randomFireworkSizesDesc: "各花火がバラエティのために異なるランダムサイズを持つ。",
            smallestSize: "最小サイズ",
            smallestSizeDesc: "ランダム花火の最小サイズ。",
            largestSize: "最大サイズ",
            largestSizeDesc: "ランダム花火の最大サイズ。",
            physicsAndBehavior: "⚙️ 物理＆動作",
            physicsSettings: "🌍 物理設定",
            maxFireworksOnScreen: "画面上最大花火数",
            maxFireworksOnScreenDesc: "同時にアクティブにできる花火の最大数。",
            gravityStrength: "重力強度",
            gravityStrengthDesc: "花火が落下する速度（高い = 速く落下）。",
            smokeTrail: "煙の軌跡",
            smokeTrailDesc: "上昇する花火の後ろの煙の軌跡の強度。",
            maxFireworks: "最大花火数",
            maxFireworksDesc: "同時にアクティブにできる花火の最大数。",
            launchHeight: "打ち上げ高度",
            launchHeightDesc: "花火が爆発する前にどの程度高く打ち上がるか。",
            explosionSize: "爆発サイズ",
            explosionSizeDesc: "花火の爆発のサイズ。",
            particleCount: "パーティクル数",
            particleCountDesc: "各爆発のパーティクル数。",
            gravity: "重力",
            gravityDesc: "爆発後にパーティクルがどれだけ速く落下するか。",
            fadeRate: "フェード率",
            fadeRateDesc: "パーティクルがどれだけ速く消えるか。",
            trailLength: "トレイル長",
            trailLengthDesc: "花火パーティクルの後ろのトレイルの長さ。"
        },
        bubbles: {
            title: "🫧 バブル設定",
            launchControls: "🚀 打ち上げ制御",
            launchPosition: "🎯 打ち上げ位置",
            positionMode: "位置モード",
            positionModeDesc: "画面下部でのバブルの配置方法",
            centerOnly: "中央のみ",
            rangeFromCenter: "中央からの範囲",
            randomAcrossScreen: "画面全体にランダム",
            launchSpread: "打ち上げ広がり",
            launchSpreadDesc: "打ち上げゾーンの幅（0% = 中心点、100% = 画面全幅）",
            centerOnlyLabel: "中央のみ",
            fullWidthLabel: "全幅",
            clusterSettings: "🫧 クラスタ設定",
            bubblesPerLaunch: "1回の打ち上げあたりのバブル数",
            bubblesPerLaunchDesc: "打ち上げのたびに作成されるバブルの数",
            noneCluster: "0（なし）",
            largeCluster: "8（大クラスタ）",
            randomBubblesPerLaunch: "ランダムバブル数",
            randomBubblesPerLaunchDesc: "各打ち上げでバラエティのためにランダム数のバブルを作成。",
            minimumBubbles: "最小バブル数",
            minimumBubblesDesc: "1回の打ち上げあたりの最小バブル数。",
            singleBubble: "1（単一）",
            mediumCluster: "5（中クラスタ）",
            maximumBubbles: "最大バブル数",
            maximumBubblesDesc: "1回の打ち上げあたりの最大バブル数。",
            smallCluster: "3（小クラスタ）",
            largeClusterMax: "8（大クラスタ）",
            clusterSpread: "クラスタ拡散",
            clusterSpreadDesc: "各クラスタ内でのバブルの広がり具合",
            tightCluster: "5px（密）",
            wideCluster: "100px（広）",
            riseSpeed: "⬆️ 上昇速度",
            baseRiseSpeed: "基本上昇速度",
            baseRiseSpeedDesc: "バブルが上向きに浮く基本速度",
            slowFloat: "0.5（ゆっくり浮遊）",
            fastRise: "5.0（速い上昇）",
            randomRiseSpeeds: "ランダム上昇速度",
            randomRiseSpeedsDesc: "各バブルがバラエティのために異なるランダム上昇速度を持つ。",
            minimumSpeed: "最小速度",
            minimumSpeedDesc: "ランダムバブルの最小上昇速度。",
            verySlow: "0.5（超遅い）",
            fastSpeed: "3.0（速い）",
            maximumSpeed: "最大速度",
            maximumSpeedDesc: "ランダムバブルの最大上昇速度。",
            moderateSpeed: "2.0（普通）",
            veryFastSpeed: "5.0（超速い）",
            quickPresets: "⚡ クイックプリセット",
            bubblePattern: "バブルパターン",
            selectPreset: "-- プリセット選択 --",
            presetDescription: "バブル設定を素早く構成するプリセットを選択",
            bubbleAppearance: "✨ バブル外観",
            sizeSettings: "📏 サイズ設定",
            bubbleSize: "バブルサイズ",
            bubbleSizeDesc: "ポップ時のバブルとアップロード画像の表示サイズを制御。",
            randomBubbleSizes: "ランダムバブルサイズ",
            randomBubbleSizesDesc: "各バブルがバラエティのために異なるランダムサイズを持つ。",
            smallestBubbleSize: "最小サイズ",
            smallestBubbleSizeDesc: "ランダムバブルの最小サイズ。",
            largestBubbleSize: "最大サイズ",
            largestBubbleSizeDesc: "ランダムバブルの最大サイズ。",
            popBehavior: "💥 ポップ動作",
            testBubblePopHeightSettings: "🎯 テストバブルポップ高度設定",
            testBubbleAutoPopHeight: "テストバブル自動ポップ高度",
            testBubbleAutoPopHeightDesc: "テストバブルが自動的にポップする高度（10% = 空の低い位置、100% = 空の高い位置）",
            lowInSky: "10%（空の低い位置）",
            highInSky: "100%（空の高い位置）",
            randomTestBubblePopHeights: "ランダムテストバブルポップ高度",
            randomTestBubblePopHeightsDesc: "各テストバブルがバラエティのために異なるランダム高度でポップ。",
            minimumPopHeight: "最小ポップ高度",
            minimumPopHeightDesc: "ランダムテストバブルの最小ポップ高度（低い = 地面に近い）。",
            lowPop: "10%（低）",
            highPop: "80%（高）",
            maximumPopHeight: "最大ポップ高度",
            maximumPopHeightDesc: "ランダムテストバブルの最大ポップ高度（高い = 頂上に近い）。",
            moderatePop: "30%（普通）",
            veryHighPop: "100%（超高）",
            popSettings: "⚙️ ポップ設定",
            maxBubblesOnScreen: "画面上最大バブル数",
            maxBubblesOnScreenDesc: "同時にアクティブにできるバブルの最大数。",
            physicsAndBehavior: "⚙️ 物理＆動作",
            physicsSettings: "🌍 物理設定",
            bubbleGravity: "バブル重力",
            bubbleGravityDesc: "重力がバブルに与える影響（高い = 速く落下）。",
            wobbleIntensity: "揺れ強度",
            wobbleIntensityDesc: "バブルが浮遊する際の揺れ具合（0 = 真っ直ぐ上）。",
            buoyancy: "浮力",
            buoyancyDesc: "バブルが重力に抵抗する力（高い = より良く浮遊）。",
            maxBubbles: "最大バブル数",
            maxBubblesDesc: "同時にアクティブにできるバブルの最大数。",
            riseSpeedAlt: "上昇速度",
            riseSpeedDescAlt: "バブルが画面を上昇する速度。",
            popIntensity: "ポップ強度",
            popIntensityDesc: "バブルポップアニメーションの強度。",
            transparency: "透明度",
            transparencyDesc: "バブルがどれほど透明に見えるか。",
            wobble: "揺れエフェクト",
            wobbleDesc: "バブルが上昇する際にどれだけ揺れるか。"
        },
        effects: {
            title: "✨ 視覚効果設定",
            animationSpeed: "アニメーション速度",
            animationSpeedDesc: "すべてのアニメーションの全体的な速度（高い＝速い、低い＝スロー）。",
            explosionParticles: "爆発パーティクル",
            explosionParticlesDesc: "花火が爆発するときに作成されるキラキラパーティクルの数。",
            particleDuration: "パーティクル持続時間",
            particleDurationDesc: "爆発パーティクルが消える前にどれだけ長く見えるか。",
            smallestParticles: "最小パーティクル",
            smallestParticlesDesc: "個別の爆発パーティクルの最小サイズ。",
            largestParticles: "最大パーティクル",
            largestParticlesDesc: "個別の爆発パーティクルの最大サイズ。",
            colorfulParticles: "カラフルパーティクル",
            colorfulParticlesDesc: "単一色の爆発の代わりにパーティクルに複数の色を使用する。",
            glowEffect: "グローエフェクト",
            glowEffectDesc: "花火とパーティクルの周りに美しいグローオーラを追加する。",
            particleFadeSpeed: "パーティクル消散速度",
            particleFadeSpeedDesc: "パーティクルがどれだけ速く消えるか（高い＝ゆっくり消散、長持ち）。",
            screenShake: "画面シェイク",
            screenShakeDesc: "激しいアニメーション中に画面シェイクエフェクトを有効にする。",
            particleTrails: "パーティクルトレイル",
            particleTrailsDesc: "パーティクルの後ろのトレイルエフェクトを有効にする。"
        },
        images: {
            title: "🖼️ 画像設定",
            autoRemoveBackgrounds: "背景を自動削除",
            autoRemoveBackgroundsDesc: "アップロードされた花火画像から白/単色背景を自動的に削除する。",
            spinningImages: "回転画像",
            spinningImagesDesc: "花火の爆発中にアップロードされた画像を回転させる。",
            imageGravity: "画像重力",
            imageGravityDesc: "爆発後に画像がどれだけ速く落下するか（0＝永遠に浮遊、高い＝速く落下）。",
            backgroundSection: "📺 背景画像・動画",
            backgroundImageOpacity: "背景不透明度",
            backgroundImageOpacityDesc: "背景画像と動画がどれほど透明か（0＝見えない、1＝不透明）。",
            backgroundTransition: "背景切り替え",
            backgroundTransitionDesc: "背景メディアが次のメディアにフェードするのにかかる時間。",
            backgroundDuration: "背景表示時間",
            backgroundDurationDesc: "各背景画像または動画が次に変更されるまでの表示時間。",
            videoSettings: "🎬 動画設定",
            videoLoop: "動画をループ",
            videoLoopDesc: "動画が終了したときに自動的に再開する。",
            videoVolume: "動画音量",
            videoVolumeDesc: "背景動画の音量レベル（マイクとの競合を避けるため0に保たれます）。",
            videoFullDuration: "動画の全長再生",
            videoFullDurationDesc: "次の背景に切り替わる前に動画の全長を再生できるようにする。",
            customImages: "カスタム画像",
            customImagesDesc: "アニメーションでアップロードされたカスタム画像を使用する。"
        },
        colors: {
            title: "🎨 色・テーマ",
            colorTheme: "カラーテーマ",
            colorThemeDesc: "花火とパーティクルの色スタイルを選択する。",
            vivid: "🌈 ビビッド（明るく大胆）",
            pastel: "🌸 パステル（柔らかく優しい）",
            neon: "⚡ ネオン（電気的で光る）",
            earthy: "🍂 アーシー（自然で暖かい）",
            monochrome: "⚫ モノクローム（白黒）",
            custom: "🎨 カスタム（自分の色）",
            colorIntensity: "色の強度",
            colorIntensityDesc: "色の全体的な鮮やかさを調整します。",
            customColors: "カスタム色",
            addColor: "色を追加",
            customColorsDesc: "スウォッチをクリックして削除。",
            noCustomColors: "カスタム色はまだ追加されていません",
            colorAdded: "{{color}}をパレットに追加しました",
            colorRemoved: "{{color}}をパレットから削除しました",
            colorAlreadyExists: "色{{color}}は既にパレットにあります"
        },
        actions: {
            resetAll: "すべての設定をリセット",
            resetAllDesc: "すべての設定をデフォルト値にリセットする。",
            exportSettings: "設定をエクスポート",
            importSettings: "設定をインポート"
        }
    },

    // Preset System
    presets: {
        title: "アニメーションプリセット",
        names: {
            classic: "🎆 クラシック",
            wideCelebration: "🎉 ワイドセレブレーション",
            fountain: "⛲ ファウンテン",
            rocketStraight: "🚀 ストレートロケット",
            leftCascade: "↖️ 左カスケード",
            rightCascade: "↗️ 右カスケード",
            chaos: "🌪️ カオスモード",
            gentle: "🌸 やさしいそよ風",
            intense: "⚡ インテンスストーム",
            rainbow: "🌈 レインボーバースト",
            celebration: "🎉 セレブレーション（大クラスター、速い上昇）",
            fountainBubbles: "⛲ ファウンテン（中央、多数のバブル）",
            stream: "🌊 ストリーム（単一ライン、安定）",
            chaosBubbles: "🌪️ カオスモード（すべてランダム）",
            peaceful: "🕊️ ピースフル（遅い、広がり）",
            party: "🎊 パーティー（速い、どこでも）"
        },
        descriptions: {
            classic: "伝統的な中央発射、軽い拡散と適度な角度",
            wideCelebration: "広い角度の多様性で画面全体に花火",
            fountain: "水の噴水のような連続的な上向きの流れ",
            rocketStraight: "最小限の拡散で真っ直ぐ垂直のロケット",
            leftCascade: "左に流れる美しいカスケード効果",
            rightCascade: "右に流れる美しいカスケード効果",
            chaos: "画面全体でランダムな混沌とした爆発"
        },
        actions: {
            load: "プリセットを読み込み",
            preview: "プレビュー",
            save: "プリセットを保存",
            delete: "プリセットを削除",
            discover: "🔍 プリセットを発見",
            loadFolder: "📁 プリセットフォルダーを読み込み",
            clearAll: "🗑️ すべてクリア"
        },
        messages: {
            loaded: "プリセット '{{name}}' が正常に読み込まれました",
            saved: "'{{name}}' としてプリセットを保存しました",
            deleted: "プリセット '{{name}}' を削除しました",
            cleared: "すべてのプリセットをクリアしました",
            discovering: "利用可能なプリセットを検索中...",
            noPresets: "プリセットが読み込まれていません",
            discoverInstructions: "「プリセットを発見」をクリックして/presets/フォルダーをスキャンし、利用可能なプリセットコレクションを見つけてください。",
            loadError: "プリセットの読み込みに失敗しました",
            saveError: "プリセットの保存に失敗しました"
        },
        sections: {
            discovered: "📦 発見されたプリセット",
            loaded: "📁 読み込まれたプリセット"
        }
    },

    // Upload System
    upload: {
        instructions: {
            dragDrop: "カスタム画像をここにドラッグ&ドロップ",
            dragDropMedia: "背景画像・動画をここにドラッグ&ドロップ",
            or: "または",
            selectFiles: "ファイル選択",
            selectBgFiles: "背景ファイル選択",
            fileTypes: "対応形式: JPG、PNG、WebP（各5MB以下）",
            mediaTypes: "対応形式: 画像（JPG、PNG、GIF、WebP）・動画（MP4、WebM）• 最大100MB",
            imageDescription: "画像は花火の爆発とバブルのポップ時に表示されます",
            backgroundDescription: "背景画像はアニメーションの背後に表示されます"
        },
        buttons: {
            selectFiles: "ファイル選択",
            selectBackground: "背景選択",
            removeAll: "すべて削除",
            preview: "画像をプレビュー"
        },
        messages: {
            uploading: "{{current}}/{{total}}ファイルをアップロード中...",
            success: "{{count}}ファイルが正常にアップロードされました",
            error: "{{filename}}のアップロードに失敗しました",
            invalidType: "{{filename}}はサポートされていない画像タイプです",
            tooLarge: "{{filename}}が大きすぎます（最大5MB）",
            duplicate: "{{filename}}は既に存在します",
            removed: "{{filename}}を削除しました",
            cleared: "すべての画像をクリアしました"
        },
        errors: {
            noFiles: "ファイルが選択されていません",
            uploadFailed: "アップロードに失敗しました",
            invalidFormat: "無効なファイル形式",
            fileTooLarge: "ファイルサイズが5MB制限を超えています",
            networkError: "アップロード中にネットワークエラーが発生しました",
            serverError: "アップロード中にサーバーエラーが発生しました"
        }
    },

    // Error Messages
    errors: {
        microphone: {
            denied: "マイクアクセスが拒否されました",
            failed: "マイクの初期化に失敗しました",
            unsupported: "マイクがサポートされていません",
            busy: "マイクがビジー状態です"
        },
        files: {
            tooLarge: "ファイルが大きすぎます",
            invalidType: "無効なファイルタイプ",
            uploadFailed: "アップロードに失敗しました",
            notFound: "ファイルが見つかりません",
            corrupted: "ファイルが破損しているようです"
        },
        network: {
            offline: "インターネット接続がありません",
            timeout: "リクエストがタイムアウトしました",
            serverError: "サーバーエラー",
            forbidden: "アクセスが禁止されています"
        },
        browser: {
            compatibility: "ブラウザ互換性警告",
            unsupportedFeatures: "お使いのブラウザでは以下の機能がサポートされていません：",
            modernBrowser: "Chrome、Firefox、Safari、またはEdgeなどの最新ブラウザをお試しください。"
        },
        generic: {
            unknown: "不明なエラーが発生しました",
            tryAgain: "もう一度お試しください",
            contact: "問題が続く場合はサポートにお問い合わせください"
        }
    },

    // Success Messages
    success: {
        settings: {
            saved: "設定が正常に保存されました",
            reset: "設定がデフォルトにリセットされました",
            imported: "設定が正常にインポートされました",
            exported: "設定が正常にエクスポートされました"
        },
        files: {
            uploaded: "ファイルが正常にアップロードされました",
            removed: "ファイルが正常に削除されました",
            cleared: "すべてのファイルがクリアされました"
        },
        audio: {
            started: "音声検出を開始しました",
            stopped: "音声検出を停止しました",
            calibrated: "マイクが正常にキャリブレーションされました"
        }
    },

    // Navigation and General UI
    navigation: {
        home: "ホーム",
        settings: "設定",
        presets: "プリセット",
        upload: "アップロード",
        about: "について",
        help: "ヘルプ"
    },

    // Time and Date
    time: {
        now: "今",
        today: "今日",
        yesterday: "昨日",
        minutes: "{{count}}分前",
        hours: "{{count}}時間前",
        days: "{{count}}日前"
    },

    // Accessibility
    accessibility: {
        startButton: "アニメーションを開始",
        stopButton: "アニメーションを停止",
        settingsButton: "設定パネルを開く",
        closeButton: "パネルを閉じる",
        volumeSlider: "音量感度を調整",
        languageSelector: "インターフェース言語を選択",
        fileUpload: "画像ファイルをアップロード",
        presetSelector: "アニメーションプリセットを選択"
    },

    // Help and Instructions
    help: {
        title: "使用方法",
        gettingStarted: "はじめに",
        audioSetup: "オーディオ設定",
        customization: "カスタマイゼーション",
        troubleshooting: "トラブルシューティング",
        instructions: {
            step1: "1. 「開始」をクリックして音声検出を開始",
            step2: "2. 大きな持続音を出してアニメーションをトリガー",
            step3: "3. 設定を使用して体験をカスタマイズ",
            step4: "4. パーソナライズされた効果のためにカスタム画像をアップロード"
        }
    },

    // About Information
    about: {
        title: "Vibecoding 花火アプリ",
        description: "インタラクティブな音響反応アニメーション体験",
        version: "バージョン {{version}}",
        credits: "視覚芸術と技術への情熱で作成",
        opensource: "オープンソースプロジェクト",
        github: "GitHubで見る"
    }
};

export default translations; 