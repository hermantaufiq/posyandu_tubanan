<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // PostgreSQL: drop old enum check and recreate with 'tunggu_bidan' added
        DB::statement("ALTER TABLE antrians DROP CONSTRAINT IF EXISTS antrians_status_check");
        DB::statement("ALTER TABLE antrians ADD CONSTRAINT antrians_status_check CHECK (status IN ('menunggu','diperiksa','tunggu_bidan','selesai','batal'))");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE antrians DROP CONSTRAINT IF EXISTS antrians_status_check");
        DB::statement("ALTER TABLE antrians ADD CONSTRAINT antrians_status_check CHECK (status IN ('menunggu','diperiksa','selesai','batal'))");
    }
};
