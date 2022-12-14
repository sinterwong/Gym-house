$(document).ready(function () {
    class FullBodyPoseEmbedder {
        constructor(torso_size_multiplier = 2.5) {
            // Multiplier to apply to the torso to get minimal body size.
            this.torso_size_multiplier = torso_size_multiplier
            // Names of the landmarks as they appear in the prediction.
            this._landmark_names = {
                'nose': 0,
                'left_eye_inner': 1, 'left_eye': 2, 'left_eye_outer': 3,
                'right_eye_inner': 4, 'right_eye': 5, 'right_eye_outer': 6,
                'left_ear': 7, 'right_ear': 8,
                'mouth_left': 9, 'mouth_right': 10,
                'left_shoulder': 11, 'right_shoulder': 12,
                'left_elbow': 13, 'right_elbow': 14,
                'left_wrist': 15, 'right_wrist': 16,
                'left_pinky_1': 17, 'right_pinky_1': 18,
                'left_index_1': 19, 'right_index_1': 20,
                'left_thumb_2': 21, 'right_thumb_2': 22,
                'left_hip': 23, 'right_hip': 24,
                'left_knee': 25, 'right_knee': 26,
                'left_ankle': 27, 'right_ankle': 28,
                'left_heel': 29, 'right_heel': 30,
                'left_foot_index': 31, 'right_foot_index': 32,
            }
        }

        normalize(landmarks) {
            const normalized_landmarks = []
            const poseCenter = this.getPoseCenter(landmarks)
            const poseSize = this.getPoseSize(landmarks)
            for (let index = 0; index < landmarks.length; index++) {
                const element = landmarks[index];
                normalized_landmarks.push([(parseFloat(element[0]) - poseCenter[0]) / poseSize, (parseFloat(element[1]) - poseCenter[1]) / poseSize]);
            }
            return normalized_landmarks
        }

        norm(v1, v2) {
            return Math.sqrt(Math.pow(v1, 2) + Math.pow(v2, 2))
        }

        getPoseCenter(landmarks) {
            const leftHip = landmarks[this._landmark_names["left_hip"]]
            const rightHip = landmarks[this._landmark_names["right_hip"]]
            return this.getAveragePoints(leftHip, rightHip)
        }

        getPoseSize(landmarks) {

            // Hips center.
            const leftHip = landmarks[this._landmark_names["left_hip"]]
            const rightHip = landmarks[this._landmark_names["right_hip"]]
            const hips = this.getAveragePoints(leftHip, rightHip)

            // Shoulders center.
            const leftShoulder = landmarks[this._landmark_names["left_shoulder"]]
            const rightShoulder = landmarks[this._landmark_names["right_shoulder"]]
            const shoulders = this.getAveragePoints(leftShoulder, rightShoulder)

            // Torso size as the minimum body size.
            const distance = this.getDistance(hips, shoulders)
            const torso_size = this.norm(distance[0], distance[1]) // ??????

            // Max dist to pose center.
            const poseCenter = this.getPoseCenter(landmarks)

            const distances = []
            for (let index = 0; index < landmarks.length; index++) {
                const element = landmarks[index];
                const distance = this.getDistance(poseCenter, element)
                distances.push(this.norm(distance[0], distance[1]));
            }
            const maxDist1 = Math.max(distances)
            const maxDist2 = torso_size * this.torso_size_multiplier

            if (maxDist1 > maxDist2) {
                return maxDist1
            }
            else {
                return maxDist2
            }
        }

        getAveragePoints(p1, p2) {
            const cx = (parseFloat(p1[0]) + parseFloat(p2[0])) * 0.5
            const cy = (parseFloat(p1[1]) + parseFloat(p2[1])) * 0.5
            return [cx, cy]
        }

        getPoseDistanceEmbedding(landmarks) {
            const embedding = [
                // ??????????????????????????????????????????????????????????????????
                this.getDistance(
                    this.getAveragePoints(landmarks[this._landmark_names["left_eye"]], landmarks[this._landmark_names["right_eye"]]),
                    this.getAveragePoints(landmarks[this._landmark_names["mouth_left"]], landmarks[this._landmark_names["mouth_right"]])),
                // ?????????????????????????????????
                this.getDistance(
                    this.getAveragePoints(landmarks[this._landmark_names["left_hip"]], landmarks[this._landmark_names["right_hip"]]),
                    this.getAveragePoints(landmarks[this._landmark_names["left_shoulder"]], landmarks[this._landmark_names["right_shoulder"]])),
                // ???????????????
                this.getDistance(landmarks[this._landmark_names["left_shoulder"]], landmarks[this._landmark_names["left_elbow"]]),
                // ???????????????
                this.getDistance(landmarks[this._landmark_names["right_shoulder"]], landmarks[this._landmark_names["right_elbow"]]),
                // ???????????????
                this.getDistance(landmarks[this._landmark_names["left_elbow"]], landmarks[this._landmark_names["left_wrist"]]),
                // ???????????????
                this.getDistance(landmarks[this._landmark_names["right_elbow"]], landmarks[this._landmark_names["right_wrist"]]),
                // ???????????????
                this.getDistance(landmarks[this._landmark_names["left_hip"]], landmarks[this._landmark_names["left_knee"]]),
                // ???????????????
                this.getDistance(landmarks[this._landmark_names["right_hip"]], landmarks[this._landmark_names["right_knee"]]),
                // ??????????????????
                this.getDistance(landmarks[this._landmark_names["left_knee"]], landmarks[this._landmark_names["left_ankle"]]),
                // ??????????????????
                this.getDistance(landmarks[this._landmark_names["right_knee"]], landmarks[this._landmark_names["right_ankle"]]),

                // ???????????????
                this.getDistance(landmarks[this._landmark_names["left_shoulder"]], landmarks[this._landmark_names["left_wrist"]]),
                // ???????????????
                this.getDistance(landmarks[this._landmark_names["right_shoulder"]], landmarks[this._landmark_names["right_wrist"]]),
                // ??????????????????
                this.getDistance(landmarks[this._landmark_names["left_hip"]], landmarks[this._landmark_names["left_ankle"]]),
                // ??????????????????
                this.getDistance(landmarks[this._landmark_names["right_hip"]], landmarks[this._landmark_names["right_ankle"]]),

                this.getDistance(landmarks[this._landmark_names["left_hip"]], landmarks[this._landmark_names["left_wrist"]]),
                this.getDistance(landmarks[this._landmark_names["right_hip"]], landmarks[this._landmark_names["right_wrist"]]),

                this.getDistance(landmarks[this._landmark_names["left_shoulder"]], landmarks[this._landmark_names["left_ankle"]]),
                this.getDistance(landmarks[this._landmark_names["right_shoulder"]], landmarks[this._landmark_names["right_ankle"]]),
                this.getDistance(landmarks[this._landmark_names["left_hip"]], landmarks[this._landmark_names["left_wrist"]]),
                this.getDistance(landmarks[this._landmark_names["right_hip"]], landmarks[this._landmark_names["right_wrist"]]),

                this.getDistance(landmarks[this._landmark_names["left_elbow"]], landmarks[this._landmark_names["right_elbow"]]),
                this.getDistance(landmarks[this._landmark_names["left_knee"]], landmarks[this._landmark_names["right_knee"]]),
                this.getDistance(landmarks[this._landmark_names["left_wrist"]], landmarks[this._landmark_names["right_wrist"]]),
                this.getDistance(landmarks[this._landmark_names["left_ankle"]], landmarks[this._landmark_names["right_ankle"]])
            ]

            return embedding
        }

        getDistanceByName(landmarks, name_from, name_to) {
            const landmarksFrom = landmarks[name_from]
            const landmarksTo = landmarks[name_to]
            return this.getDistance(landmarksFrom, landmarksTo)
        }

        getDistance(landmarksFrom, landmarksTo) {
            const dx = parseFloat(landmarksTo[0]) - parseFloat(landmarksFrom[0])
            const dy = parseFloat(landmarksTo[1]) - parseFloat(landmarksFrom[1])
            // console.log([dx, dy])
            return [dx, dy]
        }

        forward(landmarks) {
            const normalized_landmarks = this.normalize(landmarks)
            const embedding = this.getPoseDistanceEmbedding(normalized_landmarks)
            return embedding
        }
    }

    class Inference {
        constructor(video, info) {
            this.defaultInfo = {
                facingMode: "user",
                width: 640,
                height: 480
            };
            this.video = video;
            this.elapsed_time = 0;
            this.time = 0;
            this.info = Object.assign(Object.assign({}, this.defaultInfo), info);
        }

        run(stream) {
            this.video.srcObject = stream;
            this.video.onloadedmetadata = () => {
                this.video.play();
                this.captureStatus()
            }
        }

        captureStatus() {
            this.time++;  // ????????????
            window.requestAnimationFrame(() => {
                this.forward()
            })
        }

        forward() {
            // ?????????????????????
            var poseInfer = null;
            this.video.paused || this.video.currentTime === this.elapsed_time || (this.elapsed_time = this.video.currentTime, poseInfer = this.info.humanPoseInfer());
            poseInfer ? poseInfer.then(() => {
                this.captureStatus()
            }) : this.captureStatus()
        }

        start() {
            navigator.mediaDevices && navigator.mediaDevices.getUserMedia || alert("No navigator.mediaDevices.getUserMedia exists.");
            return navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: this.info.facingMode,
                    width: this.info.width,
                    height: this.info.height
                }
            }).then((stream) => {
                this.run(stream)
                // ??????????????????
                // referVideoElement.play()
            }).catch((c) => {
                console.error("Failed to acquire camera feed: " + c);
                alert("Failed to acquire camera feed: " + c);
                throw c;
            })
        }
    }

    function norm(v) {
        let sum = 0
        for (let index = 0; index < v.length; index++) {
            sum += Math.pow(v[index], 2)
        }
        return Math.sqrt(sum)
    }

    function similarity(v1, v2) {
        let num = 0
        for (let index = 0; index < v1.length; index++) {
            num += v1[index] * v2[index]
        }
        const denom = norm(v1) * norm(v2)
        if (denom != 0) {
            return num / denom
        } else {
            return 0
        }
    }

    function poseResults(results) {
        if (!results.poseLandmarks || allReferLandmarks.length == 0) {
            return;
        }
        // ????????????
        for (let index = 0; index < results.poseLandmarks.length; index++) {
            results.poseLandmarks[index]["x"] = 1 - results.poseLandmarks[index]["x"];
        }

        const poseLandmarks = results.poseLandmarks;

        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        canvasRefCtx.clearRect(0, 0, canvasRefElement.width, canvasRefElement.height);

        // visualization
        canvasCtx.globalCompositeOperation = 'source-over';
        drawConnectors(canvasCtx, poseLandmarks, POSE_CONNECTIONS,
            { color: '#00FF00', lineWidth: 4 });
        drawLandmarks(canvasCtx, poseLandmarks,
            { color: '#FF0000', lineWidth: 2 });

        let referLandmarks = allReferLandmarks.pop()
        for (let index = 0; index < referLandmarks.length; index++) {
            referLandmarks[index]["x"] = 1 - referLandmarks[index]["x"];
        }
        canvasRefCtx.globalCompositeOperation = 'source-over';
        drawConnectors(canvasRefCtx, referLandmarks, POSE_CONNECTIONS,
            { color: '#00FF00', lineWidth: 4 });
        drawLandmarks(canvasRefCtx, referLandmarks,
            { color: '#FF0000', lineWidth: 2 });

        // ??????????????????
        const realLandmarks = [];
        for (let index = 0; index < poseLandmarks.length; index++) {
            const element = poseLandmarks[index];
            realLandmarks.push([element["x"] * canvasElement.width, element["y"] * canvasElement.height]);
        }

        // ????????????pose???????????????
        const realReferLandmarks = []
        for (let index = 0; index < referLandmarks.length; index++) {
            const element = referLandmarks[index];
            realReferLandmarks.push([element["x"] * canvasElement.width, element["y"] * canvasElement.height]);
        }

        const embedding = poseEmbedder.forward(realLandmarks)
        const referEmbedding = poseEmbedder.forward(realReferLandmarks)
        let sumSimilars = 0
        let remind = ""
        let remindMinScore = 99
        for (let index = 0; index < embedding.length; index++) {
            const v1 = embedding[index];
            const v2 = referEmbedding[index];
            const simi = similarity(v1, v2)
            sumSimilars += simi
            if (simi < 0.8 && index < 10) {
                if (simi < remindMinScore) {
                    remind = remindMapping[index]
                    remindMinScore = simi
                }
            }
        }
        const meanSimilar = sumSimilars / embedding.length

        if (meanSimilar > 0.95) {
            isStandardElement.style.color = "green";
            isStandardElement.innerHTML = "??????????????? " + "??????";
        } else {
            isStandardElement.style.color = "red";
            isStandardElement.innerHTML = "??????????????? " + "?????????";
        }

        remindElement.innerHTML = "????????????: " + remind;
    }

    const videoElement = document.getElementById("video")
    // const referVideoElement = document.getElementById("refer_video")
    const isStandardElement = document.getElementById("standard")
    const remindElement = document.getElementById("remind")
    const canvasElement = document.getElementById("own_canvas")
    const canvasRefElement = document.getElementById("ref_canvas")
    const canvasCtx = canvasElement.getContext("2d")
    const canvasRefCtx = canvasRefElement.getContext("2d")
    const poseEmbedder = new FullBodyPoseEmbedder()
    const remindMapping = {
        0: "????????????????????????",
        1: "?????????????????????!",
        2: "??????????????????!",
        3: "??????????????????!",
        4: "??????????????????!",
        5: "??????????????????!",
        6: "??????????????????!",
        7: "??????????????????!",
        8: "??????????????????!",
        9: "??????????????????!"
    }

    // ????????????????????????????????????????????????
    const allReferLandmarks = getReferLandmarks()

    // ?????? Pose
    const pose = new Pose({
        locateFile: (file) => {
            return `/resource/${file}`;
        }
    });
    pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: true,
        smoothSegmentation: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });
    pose.onResults(poseResults);

    const inference = new Inference(videoElement, {
        humanPoseInfer: async () => {
            await pose.send({ image: videoElement });
        },
        width: 720,
        height: 560
    });
    inference.start();
});
