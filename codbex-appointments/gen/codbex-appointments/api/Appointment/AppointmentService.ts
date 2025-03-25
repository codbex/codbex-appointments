import { Controller, Get, Post, Put, Delete, response } from "sdk/http"
import { Extensions } from "sdk/extensions"
import { AppointmentRepository, AppointmentEntityOptions } from "../../dao/Appointment/AppointmentRepository";
import { user } from "sdk/security"
import { ForbiddenError } from "../utils/ForbiddenError";
import { ValidationError } from "../utils/ValidationError";
import { HttpUtils } from "../utils/HttpUtils";

const validationModules = await Extensions.loadExtensionModules("codbex-appointments-Appointment-Appointment", ["validate"]);

@Controller
class AppointmentService {

    private readonly repository = new AppointmentRepository();

    @Get("/")
    public getAll(_: any, ctx: any) {
        try {
            this.checkPermissions("read");
            const options: AppointmentEntityOptions = {
                $limit: ctx.queryParameters["$limit"] ? parseInt(ctx.queryParameters["$limit"]) : undefined,
                $offset: ctx.queryParameters["$offset"] ? parseInt(ctx.queryParameters["$offset"]) : undefined
            };

            return this.repository.findAll(options);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/")
    public create(entity: any) {
        try {
            this.checkPermissions("write");
            this.validateEntity(entity);
            entity.Id = this.repository.create(entity);
            response.setHeader("Content-Location", "/services/ts/codbex-appointments/gen/codbex-appointments/api/Appointment/AppointmentService.ts/" + entity.Id);
            response.setStatus(response.CREATED);
            return entity;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Get("/count")
    public count() {
        try {
            this.checkPermissions("read");
            return this.repository.count();
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/count")
    public countWithFilter(filter: any) {
        try {
            this.checkPermissions("read");
            return this.repository.count(filter);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/search")
    public search(filter: any) {
        try {
            this.checkPermissions("read");
            return this.repository.findAll(filter);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Get("/:id")
    public getById(_: any, ctx: any) {
        try {
            this.checkPermissions("read");
            const id = parseInt(ctx.pathParameters.id);
            const entity = this.repository.findById(id);
            if (entity) {
                return entity;
            } else {
                HttpUtils.sendResponseNotFound("Appointment not found");
            }
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Put("/:id")
    public update(entity: any, ctx: any) {
        try {
            this.checkPermissions("write");
            entity.Id = ctx.pathParameters.id;
            this.validateEntity(entity);
            this.repository.update(entity);
            return entity;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Delete("/:id")
    public deleteById(_: any, ctx: any) {
        try {
            this.checkPermissions("write");
            const id = ctx.pathParameters.id;
            const entity = this.repository.findById(id);
            if (entity) {
                this.repository.deleteById(id);
                HttpUtils.sendResponseNoContent();
            } else {
                HttpUtils.sendResponseNotFound("Appointment not found");
            }
        } catch (error: any) {
            this.handleError(error);
        }
    }

    private handleError(error: any) {
        if (error.name === "ForbiddenError") {
            HttpUtils.sendForbiddenRequest(error.message);
        } else if (error.name === "ValidationError") {
            HttpUtils.sendResponseBadRequest(error.message);
        } else {
            HttpUtils.sendInternalServerError(error.message);
        }
    }

    private checkPermissions(operationType: string) {
        if (operationType === "read" && !(user.isInRole("codbex-appointments.Appointment.AppointmentReadOnly") || user.isInRole("codbex-appointments.Appointment.AppointmentFullAccess"))) {
            throw new ForbiddenError();
        }
        if (operationType === "write" && !user.isInRole("codbex-appointments.Appointment.AppointmentFullAccess")) {
            throw new ForbiddenError();
        }
    }

    private validateEntity(entity: any): void {
        if (entity.Operator === null || entity.Operator === undefined) {
            throw new ValidationError(`The 'Operator' property is required, provide a valid value`);
        }
        if (entity.Assigee === null || entity.Assigee === undefined) {
            throw new ValidationError(`The 'Assigee' property is required, provide a valid value`);
        }
        if (entity.IntakeDate === null || entity.IntakeDate === undefined) {
            throw new ValidationError(`The 'IntakeDate' property is required, provide a valid value`);
        }
        if (entity.ReleaseDate === null || entity.ReleaseDate === undefined) {
            throw new ValidationError(`The 'ReleaseDate' property is required, provide a valid value`);
        }
        if (entity.Issue?.length > 755) {
            throw new ValidationError(`The 'Issue' exceeds the maximum length of [755] characters`);
        }
        for (const next of validationModules) {
            next.validate(entity);
        }
    }

}
