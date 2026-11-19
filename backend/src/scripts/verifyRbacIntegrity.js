import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import TenantMembership from "../models/TenantMembership.js";
import PlatformRole from "../models/PlatformRole.js";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import Pet from "../models/Pet.js";
import Clinic from "../models/Clinic.js";
import Appointment from "../models/Appointment.js";
import Review from "../models/Review.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";

const sameId = (left, right) => String(left || "") === String(right || "");

try {
  await connectDB();

  const [
    memberships,
    platformRoles,
    users,
    tenants,
    pets,
    clinics,
    appointments,
    reviews,
    posts,
    comments,
  ] = await Promise.all([
    TenantMembership.find().lean(),
    PlatformRole.find().lean(),
    User.find().lean(),
    Tenant.find().lean(),
    Pet.find().lean(),
    Clinic.find().lean(),
    Appointment.find().lean(),
    Review.find().lean(),
    Post.find().lean(),
    Comment.find().lean(),
  ]);

  const userIds = new Set(users.map((user) => String(user._id)));
  const tenantIds = new Set(tenants.map((tenant) => String(tenant._id)));
  const petIds = new Set(pets.map((pet) => String(pet._id)));
  const clinicIds = new Set(clinics.map((clinic) => String(clinic._id)));
  const appointmentIds = new Set(appointments.map((appointment) => String(appointment._id)));
  const postIds = new Set(posts.map((post) => String(post._id)));

  const orphanMemberships = memberships.filter((membership) =>
    !userIds.has(String(membership.userId)) ||
    !tenantIds.has(String(membership.tenantId))
  );
  const orphanPlatformRoles = platformRoles.filter((platformRole) =>
    !userIds.has(String(platformRole.userId))
  );
  const orphanPets = pets.filter((pet) =>
    !userIds.has(String(pet.owner)) ||
    !tenantIds.has(String(pet.tenantId))
  );
  const orphanClinics = clinics.filter((clinic) =>
    !userIds.has(String(clinic.owner)) ||
    !tenantIds.has(String(clinic.tenantId))
  );
  const mismatchedAppointments = appointments.filter((appointment) => {
    const pet = pets.find((item) => sameId(item._id, appointment.pet));
    const clinic = clinics.find((item) => sameId(item._id, appointment.clinic));
    return !petIds.has(String(appointment.pet)) ||
      !clinicIds.has(String(appointment.clinic)) ||
      !sameId(pet?.tenantId, appointment.tenantId) ||
      !sameId(clinic?.tenantId, appointment.tenantId) ||
      !sameId(pet?.owner, appointment.user);
  });
  const mismatchedReviews = reviews.filter((review) => {
    const appointment = appointments.find((item) => sameId(item._id, review.appointment));
    const clinic = clinics.find((item) => sameId(item._id, review.clinic));
    return !appointmentIds.has(String(review.appointment)) ||
      !clinicIds.has(String(review.clinic)) ||
      !sameId(appointment?.tenantId, review.tenantId) ||
      !sameId(clinic?.tenantId, review.tenantId) ||
      !sameId(appointment?.clinic, review.clinic) ||
      !sameId(appointment?.user, review.user);
  });
  const orphanPosts = posts.filter((post) =>
    !userIds.has(String(post.author)) ||
    !tenantIds.has(String(post.tenantId))
  );
  const mismatchedComments = comments.filter((comment) => {
    const post = posts.find((item) => sameId(item._id, comment.post));
    return !postIds.has(String(comment.post)) ||
      !userIds.has(String(comment.author)) ||
      !sameId(post?.tenantId, comment.tenantId);
  });

  const report = {
    generatedAt: new Date().toISOString(),
    counts: {
      users: users.length,
      tenants: tenants.length,
      memberships: memberships.length,
      platformRoles: platformRoles.length,
      pets: pets.length,
      clinics: clinics.length,
      appointments: appointments.length,
      reviews: reviews.length,
      posts: posts.length,
      comments: comments.length,
    },
    mismatches: {
      orphanMemberships: orphanMemberships.length,
      orphanPlatformRoles: orphanPlatformRoles.length,
      orphanPets: orphanPets.length,
      orphanClinics: orphanClinics.length,
      mismatchedAppointments: mismatchedAppointments.length,
      mismatchedReviews: mismatchedReviews.length,
      orphanPosts: orphanPosts.length,
      mismatchedComments: mismatchedComments.length,
    },
    mismatchDetails: {
      orphanMembershipIds: orphanMemberships.map((item) => String(item._id)),
      orphanPlatformRoleIds: orphanPlatformRoles.map((item) => String(item._id)),
      orphanPetIds: orphanPets.map((item) => String(item._id)),
      orphanClinicIds: orphanClinics.map((item) => String(item._id)),
      mismatchedAppointmentIds: mismatchedAppointments.map((item) => String(item._id)),
      mismatchedReviewIds: mismatchedReviews.map((item) => String(item._id)),
      orphanPostIds: orphanPosts.map((item) => String(item._id)),
      mismatchedCommentIds: mismatchedComments.map((item) => String(item._id)),
    },
  };

  console.log(JSON.stringify(report, null, 2));
  const mismatchCount = Object.values(report.mismatches).reduce((sum, count) => sum + count, 0);
  if (mismatchCount > 0) process.exitCode = 2;
} catch (error) {
  console.error("RBAC integrity verification failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
