'use client';

import {
  useEffect,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

import {
  onAuthStateChanged,
} from 'firebase/auth';

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

import {
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';

import {
  auth,
  storage,
  db,
} from '../../lib/firebase';

import MentorLayout from '../components/MentorLayout';

export default function UploadMedia() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [image, setImage] =
    useState<File | null>(null);

  const [video, setVideo] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState<string | null>(null);

  const [videoPreview, setVideoPreview] =
    useState<string | null>(null);

  const [currentImage, setCurrentImage] =
    useState<string | null>(null);

  const [currentVideo, setCurrentVideo] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState('');

  const [
    messageType,
    setMessageType,
  ] = useState<
    'success' | 'error' | ''
  >('');

  const [mentorId, setMentorId] =
    useState('');

  const [robotName, setRobotName] =
    useState('');

  const [robotTagline, setRobotTagline] =
    useState('');

  const [
    imageUploadCount,
    setImageUploadCount,
  ] = useState(0);

  const [
    videoUploaded,
    setVideoUploaded,
  ] = useState(false);

  const MAX_IMAGE_SIZE =
    1 * 1024 * 1024;

  const MAX_VIDEO_SIZE =
    3 * 1024 * 1024;

  const MAX_IMAGE_UPLOADS = 3;

  // ========================================
  // VERIFY REAL MENTOR
  // ========================================

  const verifyMentor =
    async () => {
      const user =
        auth.currentUser;

      if (!user) {
        throw new Error(
          'Not authenticated'
        );
      }

      const mentorSnapshot =
        await getDoc(
          doc(
            db,
            'mentors',
            user.uid
          )
        );

      if (!mentorSnapshot.exists()) {
        throw new Error(
          'MENTOR_REQUIRED'
        );
      }

      const data =
        mentorSnapshot.data();

      const verifiedMentorId =
        typeof data.mentorId ===
          'string'
          ? data.mentorId.trim()
          : '';

      if (!verifiedMentorId) {
        throw new Error(
          'MENTOR_ID_MISSING'
        );
      }

      return {
        user,
        mentorId:
          verifiedMentorId,
      };
    };

  // ========================================
  // LOAD MENTOR
  // ========================================

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async user => {
          if (!user) {
            router.replace(
              '/login'
            );

            return;
          }

          try {
            // IMPORTANT:
            // This page NEVER creates
            // mentor accounts.
            //
            // A mentor document must
            // already exist.

            const mentorSnapshot =
              await getDoc(
                doc(
                  db,
                  'mentors',
                  user.uid
                )
              );

            if (
              !mentorSnapshot.exists()
            ) {
              console.warn(
                'Non-mentor attempted to access mentor media page'
              );

              router.replace(
                '/student-entry'
              );

              return;
            }

            const mentorData =
              mentorSnapshot.data();

            const currentMentorId =
              typeof mentorData
                .mentorId ===
              'string'
                ? mentorData
                    .mentorId
                    .trim()
                : '';

            if (!currentMentorId) {
              setMessage(
                'Mentor account is missing a Mentor ID.'
              );

              setMessageType(
                'error'
              );

              setLoading(false);

              return;
            }

            setMentorId(
              currentMentorId
            );

            // =========================
            // LOAD EXISTING MEDIA
            // =========================

            const mediaDoc =
              await getDoc(
                doc(
                  db,
                  'mentor_media',
                  currentMentorId
                )
              );

            if (
              mediaDoc.exists()
            ) {
              const data =
                mediaDoc.data();

              if (
                data.robotName
              ) {
                setRobotName(
                  data.robotName
                );
              }

              if (
                data.robotTagline
              ) {
                setRobotTagline(
                  data.robotTagline
                );
              }

              if (
                data.imageUrl
              ) {
                setCurrentImage(
                  data.imageUrl
                );
              }

              if (
                data.videoUrl
              ) {
                setCurrentVideo(
                  data.videoUrl
                );
              }

              if (
                typeof data
                  .imageUploadCount ===
                'number'
              ) {
                setImageUploadCount(
                  data.imageUploadCount
                );
              }

              if (
                data.videoUploaded ===
                true
              ) {
                setVideoUploaded(
                  true
                );
              }
            }

            setLoading(false);
          } catch (error) {
            console.error(
              'Mentor media load error:',
              error
            );

            setMessage(
              'Unable to verify mentor account.'
            );

            setMessageType(
              'error'
            );

            setLoading(false);
          }
        }
      );

    return () =>
      unsubscribe();
  }, [router]);

  // ========================================
  // SAVE ROBOT DETAILS
  // ========================================

  const handleSaveRobotDetails =
    async () => {
      if (!robotName.trim()) {
        setMessage(
          'Please enter a robot name'
        );

        setMessageType(
          'error'
        );

        return;
      }

      setSaving(true);
      setMessage('');
      setMessageType('');

      try {
        const mentor =
          await verifyMentor();

        const data = {
          robotName:
            robotName.trim(),

          robotTagline:
            robotTagline.trim() ||
            'Intelligent, disciplined, and precise forex trading AI',

          mentorEmail:
            mentor.user.email,

          mentorUid:
            mentor.user.uid,

          mentorId:
            mentor.mentorId,

          updatedAt:
            new Date()
              .toISOString(),
        };

        await setDoc(
          doc(
            db,
            'mentor_media',
            mentor.user.uid
          ),
          data,
          {
            merge: true,
          }
        );

        await setDoc(
          doc(
            db,
            'mentor_media',
            mentor.mentorId
          ),
          data,
          {
            merge: true,
          }
        );

        setMessage(
          '✅ Robot details saved!'
        );

        setMessageType(
          'success'
        );
      } catch (error) {
        console.error(
          'Save robot details error:',
          error
        );

        const message =
          error instanceof Error
            ? error.message
            : '';

        if (
          message ===
          'MENTOR_REQUIRED'
        ) {
          router.replace(
            '/student-entry'
          );

          return;
        }

        setMessage(
          '❌ Failed: ' +
            (
              error as Error
            ).message
        );

        setMessageType(
          'error'
        );
      } finally {
        setSaving(false);
      }
    };

  // ========================================
  // IMAGE UPLOAD
  // ========================================

  const handleImageUpload =
    async () => {
      if (!image) {
        setMessage(
          'Please select an image first'
        );

        setMessageType(
          'error'
        );

        return;
      }

      if (
        image.size >
        MAX_IMAGE_SIZE
      ) {
        setMessage(
          '❌ Image too large. Max 1 MB allowed.'
        );

        setMessageType(
          'error'
        );

        return;
      }

      if (
        imageUploadCount >=
        MAX_IMAGE_UPLOADS
      ) {
        setMessage(
          `❌ You've used all ${MAX_IMAGE_UPLOADS} image uploads.`
        );

        setMessageType(
          'error'
        );

        return;
      }

      setUploading(true);
      setMessage('');
      setMessageType('');

      try {
        const mentor =
          await verifyMentor();

        const imageRef =
          ref(
            storage,
            `mentors/${mentor.user.uid}/robot-image`
          );

        await uploadBytes(
          imageRef,
          image
        );

        const url =
          await getDownloadURL(
            imageRef
          );

        const newCount =
          imageUploadCount + 1;

        const data = {
          imageUrl: url,

          robotName:
            robotName.trim() ||
            'ZETAVIA',

          robotTagline:
            robotTagline.trim() ||
            'Intelligent, disciplined, and precise forex trading AI',

          mentorEmail:
            mentor.user.email,

          mentorUid:
            mentor.user.uid,

          mentorId:
            mentor.mentorId,

          imageUploadCount:
            newCount,

          updatedAt:
            new Date()
              .toISOString(),
        };

        await setDoc(
          doc(
            db,
            'mentor_media',
            mentor.user.uid
          ),
          data,
          {
            merge: true,
          }
        );

        await setDoc(
          doc(
            db,
            'mentor_media',
            mentor.mentorId
          ),
          data,
          {
            merge: true,
          }
        );

        setCurrentImage(
          url
        );

        setImageUploadCount(
          newCount
        );

        setImage(null);

        setImagePreview(
          null
        );

        const remaining =
          MAX_IMAGE_UPLOADS -
          newCount;

        setMessage(
          `✅ Image uploaded! ${remaining} upload${
            remaining !== 1
              ? 's'
              : ''
          } remaining.`
        );

        setMessageType(
          'success'
        );
      } catch (error) {
        console.error(
          'Image upload error:',
          error
        );

        if (
          error instanceof Error &&
          error.message ===
            'MENTOR_REQUIRED'
        ) {
          router.replace(
            '/student-entry'
          );

          return;
        }

        setMessage(
          '❌ Failed: ' +
            (
              error as Error
            ).message
        );

        setMessageType(
          'error'
        );
      } finally {
        setUploading(false);
      }
    };

  // ========================================
  // VIDEO UPLOAD
  // ========================================

  const handleVideoUpload =
    async () => {
      if (!video) {
        setMessage(
          'Please select a video first'
        );

        setMessageType(
          'error'
        );

        return;
      }

      if (
        video.size >
        MAX_VIDEO_SIZE
      ) {
        setMessage(
          '❌ Video too large. Max 3 MB allowed.'
        );

        setMessageType(
          'error'
        );

        return;
      }

      if (videoUploaded) {
        setMessage(
          '❌ Video can only be uploaded once. Contact support to change.'
        );

        setMessageType(
          'error'
        );

        return;
      }

      setUploading(true);
      setMessage('');
      setMessageType('');

      try {
        const mentor =
          await verifyMentor();

        const videoRef =
          ref(
            storage,
            `mentors/${mentor.user.uid}/robot-video`
          );

        await uploadBytes(
          videoRef,
          video
        );

        const url =
          await getDownloadURL(
            videoRef
          );

        const data = {
          videoUrl: url,

          robotName:
            robotName.trim() ||
            'ZETAVIA',

          robotTagline:
            robotTagline.trim() ||
            'Intelligent, disciplined, and precise forex trading AI',

          mentorEmail:
            mentor.user.email,

          mentorUid:
            mentor.user.uid,

          mentorId:
            mentor.mentorId,

          videoUploaded:
            true,

          updatedAt:
            new Date()
              .toISOString(),
        };

        await setDoc(
          doc(
            db,
            'mentor_media',
            mentor.user.uid
          ),
          data,
          {
            merge: true,
          }
        );

        await setDoc(
          doc(
            db,
            'mentor_media',
            mentor.mentorId
          ),
          data,
          {
            merge: true,
          }
        );

        setCurrentVideo(
          url
        );

        setVideoUploaded(
          true
        );

        setVideo(null);

        setVideoPreview(
          null
        );

        setMessage(
          '✅ Video uploaded! This is a one-time upload.'
        );

        setMessageType(
          'success'
        );
      } catch (error) {
        console.error(
          'Video upload error:',
          error
        );

        if (
          error instanceof Error &&
          error.message ===
            'MENTOR_REQUIRED'
        ) {
          router.replace(
            '/student-entry'
          );

          return;
        }

        setMessage(
          '❌ Failed: ' +
            (
              error as Error
            ).message
        );

        setMessageType(
          'error'
        );
      } finally {
        setUploading(false);
      }
    };

  // ========================================
  // REMOVE IMAGE
  // ========================================

  const handleRemoveImage =
    async () => {
      if (
        !confirm(
          'Remove your robot image? You can upload a new one (uses 1 upload).'
        )
      ) {
        return;
      }

      setUploading(true);

      try {
        const mentor =
          await verifyMentor();

        const imageRef =
          ref(
            storage,
            `mentors/${mentor.user.uid}/robot-image`
          );

        await deleteObject(
          imageRef
        ).catch(() => {});

        await setDoc(
          doc(
            db,
            'mentor_media',
            mentor.user.uid
          ),
          {
            imageUrl: null,
          },
          {
            merge: true,
          }
        );

        await setDoc(
          doc(
            db,
            'mentor_media',
            mentor.mentorId
          ),
          {
            imageUrl: null,
          },
          {
            merge: true,
          }
        );

        setCurrentImage(
          null
        );

        setMessage(
          '✅ Image removed'
        );

        setMessageType(
          'success'
        );
      } catch (error) {
        console.error(
          'Remove image error:',
          error
        );

        if (
          error instanceof Error &&
          error.message ===
            'MENTOR_REQUIRED'
        ) {
          router.replace(
            '/student-entry'
          );

          return;
        }

        setMessage(
          '❌ Failed to remove: ' +
            (
              error as Error
            ).message
        );

        setMessageType(
          'error'
        );
      } finally {
        setUploading(false);
      }
    };

  // ========================================
  // REMOVE VIDEO
  // ========================================

  const handleRemoveVideo =
    async () => {
      if (
        !confirm(
          'Remove your robot video?'
        )
      ) {
        return;
      }

      setUploading(true);

      try {
        const mentor =
          await verifyMentor();

        const videoRef =
          ref(
            storage,
            `mentors/${mentor.user.uid}/robot-video`
          );

        await deleteObject(
          videoRef
        ).catch(() => {});

        await setDoc(
          doc(
            db,
            'mentor_media',
            mentor.user.uid
          ),
          {
            videoUrl: null,
          },
          {
            merge: true,
          }
        );

        await setDoc(
          doc(
            db,
            'mentor_media',
            mentor.mentorId
          ),
          {
            videoUrl: null,
          },
          {
            merge: true,
          }
        );

        setCurrentVideo(
          null
        );

        setMessage(
          '✅ Video removed'
        );

        setMessageType(
          'success'
        );
      } catch (error) {
        console.error(
          'Remove video error:',
          error
        );

        if (
          error instanceof Error &&
          error.message ===
            'MENTOR_REQUIRED'
        ) {
          router.replace(
            '/student-entry'
          );

          return;
        }

        setMessage(
          '❌ Failed to remove: ' +
            (
              error as Error
            ).message
        );

        setMessageType(
          'error'
        );
      } finally {
        setUploading(false);
      }
    };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="spinner-red" />
      </div>
    );
  }

  return (
    <MentorLayout>
      <div className="p-6 max-w-2xl">
        <h1 className="text-2xl font-bold text-white mb-2">
          Upload Media
        </h1>

        <p className="text-gray-400 text-sm mb-6">
          Set up your robot&apos;s
          name, image, and demo video.
        </p>

        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
          <p className="text-gray-400 text-sm">
            Your Mentor ID:
          </p>

          <p className="text-white font-bold text-2xl tracking-wider">
            {mentorId ||
              'Loading...'}
          </p>

          <p className="text-gray-500 text-xs mt-1">
            Share this ID with your
            students
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl mb-4 ${
              messageType ===
              'success'
                ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}
          >
            {message}
          </div>
        )}

        <div className="bg-black/50 border border-red-500/20 rounded-xl p-6 mb-4">
          <h3 className="text-white font-bold mb-2">
            Robot Details
          </h3>

          <p className="text-gray-400 text-sm mb-4">
            Give your robot a name.
            Students will see this on
            their app.
          </p>

          <div className="mb-4">
            <label className="text-gray-400 text-sm block mb-2">
              Robot Name *
            </label>

            <input
              type="text"
              value={robotName}
              onChange={e =>
                setRobotName(
                  e.target.value
                )
              }
              placeholder="e.g. ZETAVIA"
              className="w-full px-4 py-3 bg-black/50 border border-red-500/20 rounded-lg text-white placeholder-gray-600 focus:border-red-500 focus:outline-none transition uppercase"
            />
          </div>

          <div className="mb-4">
            <label className="text-gray-400 text-sm block mb-2">
              Tagline (optional)
            </label>

            <input
              type="text"
              value={robotTagline}
              onChange={e =>
                setRobotTagline(
                  e.target.value
                )
              }
              placeholder="e.g. Intelligent, disciplined, and precise forex trading AI"
              className="w-full px-4 py-3 bg-black/50 border border-red-500/20 rounded-lg text-white placeholder-gray-600 focus:border-red-500 focus:outline-none transition"
            />
          </div>

          <button
            onClick={
              handleSaveRobotDetails
            }
            disabled={saving}
            className="w-full py-3 bg-red-600 rounded-lg text-white font-bold hover:bg-red-700 transition disabled:opacity-50"
          >
            {saving
              ? 'Saving...'
              : 'Save Robot Details'}
          </button>
        </div>

        <div className="bg-black/50 border border-red-500/20 rounded-xl p-6 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-bold">
              Robot Image
            </h3>

            <span className="text-xs text-gray-400">
              {imageUploadCount}/
              {MAX_IMAGE_UPLOADS}{' '}
              uploads used
            </span>
          </div>

          <p className="text-gray-400 text-sm mb-4">
            Max 1 MB · JPG or PNG
          </p>

          {currentImage && (
            <div className="mb-4">
              <p className="text-green-400 text-xs mb-2">
                ✓ Current image:
              </p>

              <img
                src={currentImage}
                alt="Current"
                className="w-32 h-32 object-cover rounded-lg border border-green-500/30"
              />

              <button
                onClick={
                  handleRemoveImage
                }
                disabled={uploading}
                className="mt-2 px-3 py-1 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-xs hover:bg-red-500/30 transition"
              >
                🗑️ Remove Image
              </button>
            </div>
          )}

          {imageUploadCount <
          MAX_IMAGE_UPLOADS ? (
            <>
              {imagePreview && (
                <div className="mb-4">
                  <p className="text-gray-400 text-xs mb-2">
                    New image preview:
                  </p>

                  <img
                    src={
                      imagePreview
                    }
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border border-red-500/20"
                  />
                </div>
              )}

              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={e => {
                  const file =
                    e.target.files?.[0] ||
                    null;

                  if (
                    file &&
                    file.size >
                      MAX_IMAGE_SIZE
                  ) {
                    setMessage(
                      '❌ Image too large. Max 1 MB.'
                    );

                    setMessageType(
                      'error'
                    );

                    return;
                  }

                  setImage(file);

                  if (file) {
                    const reader =
                      new FileReader();

                    reader.onload =
                      () =>
                        setImagePreview(
                          reader.result as string
                        );

                    reader.readAsDataURL(
                      file
                    );
                  }
                }}
                className="w-full px-4 py-3 bg-black/50 border border-red-500/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-600 file:text-white hover:file:bg-red-700"
              />

              <button
                onClick={
                  handleImageUpload
                }
                disabled={
                  !image ||
                  uploading
                }
                className="mt-4 px-6 py-3 bg-red-600 rounded-lg text-white font-bold hover:bg-red-700 transition disabled:opacity-50"
              >
                {uploading
                  ? 'Uploading...'
                  : 'Upload Image'}
              </button>
            </>
          ) : (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-yellow-400 text-xs">
                ⚠️ You&apos;ve used
                all{' '}
                {
                  MAX_IMAGE_UPLOADS
                }{' '}
                image uploads.
              </p>
            </div>
          )}
        </div>

        <div className="bg-black/50 border border-red-500/20 rounded-xl p-6 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-bold">
              Robot Video / GIF
            </h3>

            <span
              className={`text-xs ${
                videoUploaded
                  ? 'text-yellow-400'
                  : 'text-gray-400'
              }`}
            >
              {videoUploaded
                ? '🔒 One-time upload used'
                : '1 upload only'}
            </span>
          </div>

          <p className="text-gray-400 text-sm mb-4">
            Max 3 MB · MP4 or GIF
          </p>

          {currentVideo && (
            <div className="mb-4">
              <p className="text-green-400 text-xs mb-2">
                ✓ Current video:
              </p>

              <video
                src={currentVideo}
                controls
                className="w-full max-h-48 rounded-lg border border-green-500/30"
              />

              <button
                onClick={
                  handleRemoveVideo
                }
                disabled={uploading}
                className="mt-2 px-3 py-1 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-xs hover:bg-red-500/30 transition"
              >
                🗑️ Remove Video
              </button>
            </div>
          )}

          {!videoUploaded ? (
            <>
              {videoPreview && (
                <div className="mb-4">
                  <p className="text-gray-400 text-xs mb-2">
                    New video preview:
                  </p>

                  <video
                    src={
                      videoPreview
                    }
                    controls
                    className="w-full max-h-48 rounded-lg border border-red-500/20"
                  />
                </div>
              )}

              <input
                type="file"
                accept="video/mp4,video/webm,image/gif"
                onChange={e => {
                  const file =
                    e.target.files?.[0] ||
                    null;

                  if (
                    file &&
                    file.size >
                      MAX_VIDEO_SIZE
                  ) {
                    setMessage(
                      '❌ Video too large. Max 3 MB.'
                    );

                    setMessageType(
                      'error'
                    );

                    return;
                  }

                  setVideo(file);

                  if (file) {
                    const reader =
                      new FileReader();

                    reader.onload =
                      () =>
                        setVideoPreview(
                          reader.result as string
                        );

                    reader.readAsDataURL(
                      file
                    );
                  }
                }}
                className="w-full px-4 py-3 bg-black/50 border border-red-500/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-600 file:text-white hover:file:bg-red-700"
              />

              <button
                onClick={
                  handleVideoUpload
                }
                disabled={
                  !video ||
                  uploading
                }
                className="mt-4 px-6 py-3 bg-red-600 rounded-lg text-white font-bold hover:bg-red-700 transition disabled:opacity-50"
              >
                {uploading
                  ? 'Uploading...'
                  : 'Upload Video (One Time)'}
              </button>
            </>
          ) : (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-yellow-400 text-xs">
                ⚠️ Video can only
                be uploaded once.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-400 text-xs">
            ⚠️ Uploaded media will
            be visible to all
            students who use your
            Mentor ID.
          </p>
        </div>
      </div>
    </MentorLayout>
  );
}