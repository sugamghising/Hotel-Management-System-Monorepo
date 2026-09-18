import { Router } from "express";
import { PERMISSIONS } from "../../core/constants/permission";
import {
  requireOrganization,
  requirePermission,
} from "../../core/middleware/requirePermission";
import { validate } from "../../core/middleware/validate";
import { OrganizationController } from "./organization.controller";
import {
  OrganizationCreateSchema,
  OrganizationIdParamSchema,
  OrganizationQuerySchema,
  OrganizationUpdateSchema,
  SubscriptionUpdateSchema,
} from "./organization.dto";
import { authMiddleware } from "@/core/middleware/auth";

const router = Router();
const controller = new OrganizationController();

// Validation middlewares
const queryValidation = validate({ query: OrganizationQuerySchema });
const createValidation = validate({ body: OrganizationCreateSchema });
const updateValidation = validate({ body: OrganizationUpdateSchema });
const paramsValidation = validate({ params: OrganizationIdParamSchema });
const subscriptionValidation = validate({ body: SubscriptionUpdateSchema });

router.use(authMiddleware);
// Routes
router.get(
  "/",
  requirePermission(PERMISSIONS.ORGANIZATION.READ),
  queryValidation,
  controller.getAll,
);
router.post(
  "/",
  requirePermission(PERMISSIONS.ORGANIZATION.CREATE),
  createValidation,
  controller.create,
);

router.get(
  "/:id",
  requirePermission(PERMISSIONS.ORGANIZATION.READ),
  paramsValidation,
  requireOrganization("id"),
  controller.getById,
);
router.patch(
  "/:id",
  requirePermission(PERMISSIONS.ORGANIZATION.UPDATE),
  paramsValidation,
  requireOrganization("id"),
  updateValidation,
  controller.update,
);
router.delete(
  "/:id",
  requirePermission(PERMISSIONS.ORGANIZATION.DELETE),
  paramsValidation,
  requireOrganization("id"),
  controller.delete,
);

router.post(
  "/:id/subscription",
  requirePermission(PERMISSIONS.ORGANIZATION.MANAGE_SUBSCRIPTION),
  paramsValidation,
  requireOrganization("id"),
  subscriptionValidation,
  controller.updateSubscription,
);
router.get(
  "/:id/stats",
  requirePermission(PERMISSIONS.ORGANIZATION.READ),
  paramsValidation,
  requireOrganization("id"),
  controller.getStats,
);
router.get(
  "/:id/limits",
  requirePermission(PERMISSIONS.ORGANIZATION.READ),
  paramsValidation,
  requireOrganization("id"),
  controller.checkLimits,
);

export default router;
