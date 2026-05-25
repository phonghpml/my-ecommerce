ALTER TABLE "admin_logs" DROP CONSTRAINT "admin_logs_admin_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_order_id_orders_id_fk";
--> statement-breakpoint
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_category_id_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "admin_logs" ALTER COLUMN "admin_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_logs" ALTER COLUMN "timestamp" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "admin_logs" ALTER COLUMN "timestamp" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "admin_logs" ALTER COLUMN "timestamp" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "order_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "product_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "price" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "total_price" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "price" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "stock" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_log_idx" ON "admin_logs" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "order_item_order_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_user_idx" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "product_category_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_name_unique" UNIQUE("name");